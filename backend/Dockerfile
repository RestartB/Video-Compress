FROM ghcr.io/astral-sh/uv:alpine

WORKDIR /app
COPY pyproject.toml uv.lock .python-version ./

RUN apk add --no-cache \
    curl \
    ca-certificates \
    ffmpeg

ENV UV_NO_DEV=1
ENV UV_NO_CACHE=1
RUN uv sync --locked

COPY . .

EXPOSE 4000
CMD ["uv", "run", "gunicorn", "-w", "4", "-b", "0.0.0.0:4000", "main:gunicorn_app"]