import { z } from 'astro/zod';

/** CMS controls can serialize a cleared optional value as "" or null. */
export function optionalContentField<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) =>
      value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value,
    schema.optional(),
  );
}

export const httpUrl = z
  .url()
  .refine((value) => URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol), {
    message: '请使用 http 或 https 链接。',
  });

const publicPath = z
  .string()
  .startsWith('/')
  .refine((value) => !value.startsWith('//'), { message: '请使用站内公共路径。' });

export const imageLocation = z.union([httpUrl, publicPath]);
export const uploadedImageLocation = publicPath.refine((value) => value.startsWith('/images/'), {
  message: '上传图片必须使用 /images/... 公共路径。',
});

/** An uploaded cover takes priority without replacing the stored legacy URL. */
export function resolveCover<
  T extends { upload?: string | undefined; url?: string | undefined; image?: unknown },
>(cover: T) {
  return {
    ...cover,
    image: cover.upload ? undefined : cover.image,
    url: cover.upload ?? cover.url,
  };
}
