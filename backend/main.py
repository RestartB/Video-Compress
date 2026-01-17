from flask import request, Flask, jsonify
import asyncio

from pathlib import Path
import tempfile
import base64

from uuid import uuid4
import redis

app = Flask(__name__)
r = redis.Redis(host="localhost", port=6379, db=0)


@app.route("/compress", methods=["POST"])
async def compress():
    file = request.files["video"]

    with tempfile.TemporaryDirectory() as temp_folder:
        temp_path = Path(temp_folder)
        input_file_path = temp_path / (
            "input" + Path(file.filename or "input.mp4").suffix
        )

        with open(input_file_path, "wb") as input_file:
            file.save(input_file)

        # probe
        proc = await asyncio.create_subprocess_exec(
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(input_file_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        if not proc.stdout:
            raise Exception("ffprobe failed")

        duration = float((await proc.stdout.read()).decode())

        target_size_mib = max(float(request.form["target"]) - 0.5, 0.1)
        audio_bitrate = 128
        total_bitrate = (target_size_mib * 8388.608) / duration
        video_bitrate = int(total_bitrate - audio_bitrate)

        # pass 1
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-y",
            "-i",
            str(input_file_path),
            "-c:v",
            "libx264",
            "-b:v",
            f"{video_bitrate}k",
            "-pass",
            "1",
            "-passlogfile",
            str(temp_path / "ffmpeg2pass"),
            "-an",
            "-f",
            "null",
            "/dev/null",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.wait()

        # pass 2
        proc = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-i",
            str(input_file_path),
            "-c:v",
            "libx264",
            "-b:v",
            f"{video_bitrate}k",
            "-pass",
            "2",
            "-passlogfile",
            str(temp_path / "ffmpeg2pass"),
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-f",
            "mp4",
            "-y",
            str(temp_path / "output.mp4"),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await proc.wait()

        # save content to redis
        output_path = temp_path / "output.mp4"
        with open(output_path, "rb") as output_file:
            file_content = output_file.read()
            output_id = str(uuid4())
            r.set(output_id, base64.b64encode(file_content), ex=900)

            actual_size = len(file_content)

            print(f"File size: {actual_size} bytes")
            print(f"Stat size: {output_path.stat().st_size} bytes")

            return jsonify(
                {
                    "file_id": output_id,
                    "size": output_path.stat().st_size,
                }
            )


if __name__ == "__main__":
    app.run(debug=True)
