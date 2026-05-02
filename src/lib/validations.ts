import { z } from "zod";

const phoneRegex = /^(\+98|0)?9\d{9}$/;
const handleRegex = /^@?[a-zA-Z0-9._]{1,30}$/;

export const influencerSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(80, "نام طولانی است"),
  handle: z.string().trim().regex(handleRegex, "هندل اینستاگرام نامعتبر است").max(31).optional().or(z.literal("")),
  city: z.string().trim().max(50, "نام شهر طولانی است").optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex, "شماره موبایل نامعتبر است").optional().or(z.literal("")),
  email: z.string().trim().email("ایمیل نامعتبر است").max(255).optional().or(z.literal("")),
  bio: z.string().trim().max(500, "بیو حداکثر ۵۰۰ کاراکتر").optional().or(z.literal("")),
  username: z.string().trim().min(3, "نام کاربری حداقل ۳ کاراکتر").max(50).optional().or(z.literal("")),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(72).optional().or(z.literal("")),
  keyword: z.string().trim().max(50).optional().or(z.literal("")),
}).refine((d) => !d.username || !!d.password, { message: "رمز عبور برای نام کاربری الزامی است", path: ["password"] });

export const businessSchema = z.object({
  name: z.string().trim().min(2, "نام کسب‌وکار حداقل ۲ کاراکتر").max(100),
  city: z.string().trim().max(50).optional().or(z.literal("")),
  contact: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex, "شماره موبایل نامعتبر است").optional().or(z.literal("")),
  email: z.string().trim().email("ایمیل نامعتبر است").max(255).optional().or(z.literal("")),
  description: z.string().trim().max(1000, "توضیحات حداکثر ۱۰۰۰ کاراکتر").optional().or(z.literal("")),
  username: z.string().trim().min(3).max(50).optional().or(z.literal("")),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(72).optional().or(z.literal("")),
  keyword: z.string().trim().max(50).optional().or(z.literal("")),
}).refine((d) => !d.username || !!d.password, { message: "رمز عبور الزامی است", path: ["password"] });

export const campaignSchema = z.object({
  title: z.string().trim().min(3, "عنوان حداقل ۳ کاراکتر").max(120, "عنوان طولانی است"),
  business_id: z.string().min(1, "انتخاب کسب‌وکار الزامی است"),
  custom_business: z.string().trim().max(100).optional().or(z.literal("")),
  category_id: z.string().optional().or(z.literal("")),
  city: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  start_date: z.string().optional().or(z.literal("")),
  end_date: z.string().optional().or(z.literal("")),
}).refine((d) => d.business_id !== "__other__" || !!d.custom_business?.trim(), {
  message: "نام کسب‌وکار جدید را وارد کنید", path: ["custom_business"],
}).refine((d) => !d.start_date || !d.end_date || d.start_date <= d.end_date, {
  message: "تاریخ پایان باید بعد از شروع باشد", path: ["end_date"],
});

export type InfluencerForm = z.infer<typeof influencerSchema>;
export type BusinessForm = z.infer<typeof businessSchema>;
export type CampaignForm = z.infer<typeof campaignSchema>;

import { toast } from "sonner";
export function validateOrToast<T>(schema: z.ZodType<T>, data: unknown): T | null {
  const r = schema.safeParse(data);
  if (!r.success) {
    const first = r.error.issues[0];
    toast.error(first?.message || "اطلاعات نامعتبر است");
    return null;
  }
  return r.data;
}
