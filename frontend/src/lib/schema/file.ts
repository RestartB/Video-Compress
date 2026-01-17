import { z } from 'zod';

const fileSchema = z
	.object({
		video: z
			.instanceof(File, { message: 'Please select a video.' })
			.refine((f) => f.size < 500_000_000, 'Max 500 MB upload size.')
			.refine((f) => f.type.startsWith('video/'), 'Please select a video.'),
		target: z.number().min(1).max(50)
	})
	.refine((data) => data.target < data.video.size / 1_048_576, {
		message: "The target compression size must be smaller than the video's original size.",
		path: ['target']
	});

export default fileSchema;
