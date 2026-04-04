// Demo data for the Bloggerha admin dashboard

export const demoInfluencers = [
  { id: "1", name: "سارا احمدی", handle: "@sara.ahmadi", avatar: "", followers: 125000, engagement: 4.2, city: "تهران", category: "Food", status: "active", verified: true, campaigns: 12, reviews: 8, bookings: 15, gender: "female", age: 28, submittedDate: "2025-12-15" },
  { id: "2", name: "علی رضایی", handle: "@ali.rezaei", avatar: "", followers: 89000, engagement: 5.1, city: "اصفهان", category: "Product", status: "active", verified: true, campaigns: 8, reviews: 5, bookings: 10, gender: "male", age: 32, submittedDate: "2025-11-20" },
  { id: "3", name: "مریم حسینی", handle: "@maryam.h", avatar: "", followers: 210000, engagement: 3.8, city: "شیراز", category: "Beauty", status: "pending", verified: false, campaigns: 0, reviews: 0, bookings: 0, gender: "female", age: 25, submittedDate: "2026-03-28" },
  { id: "4", name: "رضا کریمی", handle: "@reza.karimi", avatar: "", followers: 56000, engagement: 6.3, city: "مشهد", category: "Sport", status: "active", verified: true, campaigns: 5, reviews: 3, bookings: 7, gender: "male", age: 30, submittedDate: "2026-01-10" },
  { id: "5", name: "نازنین موسوی", handle: "@nazanin.m", avatar: "", followers: 340000, engagement: 4.7, city: "تبریز", category: "Fashion", status: "active", verified: true, campaigns: 20, reviews: 15, bookings: 22, gender: "female", age: 27, submittedDate: "2025-10-05" },
  { id: "6", name: "امیر جعفری", handle: "@amir.jafari", avatar: "", followers: 42000, engagement: 7.1, city: "تهران", category: "Art", status: "pending", verified: false, campaigns: 0, reviews: 0, bookings: 0, gender: "male", age: 35, submittedDate: "2026-04-01" },
  { id: "7", name: "فاطمه نوری", handle: "@fatemeh.noori", avatar: "", followers: 178000, engagement: 5.5, city: "کرج", category: "Food", status: "active", verified: true, campaigns: 14, reviews: 10, bookings: 18, gender: "female", age: 29, submittedDate: "2025-09-12" },
  { id: "8", name: "محمد صادقی", handle: "@m.sadeghi", avatar: "", followers: 95000, engagement: 4.9, city: "اصفهان", category: "Hotel", status: "suspended", verified: true, campaigns: 6, reviews: 4, bookings: 8, gender: "male", age: 33, submittedDate: "2025-08-20" },
];

export const demoBusinesses = [
  { id: "1", name: "کافه لاوندر", logo: "", category: "Cafe", city: "تهران", address: "ولیعصر، بالاتر از پارک ساعی", contact: "محمد رحیمی", phone: "021-88XXXXXX", activeCampaigns: 3, completedCollabs: 15, rating: 4.6, status: "active", verified: true, submittedDate: "2025-06-10" },
  { id: "2", name: "رستوران شب‌های تهران", logo: "", category: "Restaurant", city: "تهران", address: "جردن، خیابان افریقا", contact: "سمیه کاظمی", phone: "021-22XXXXXX", activeCampaigns: 2, completedCollabs: 8, rating: 4.3, status: "active", verified: true, submittedDate: "2025-07-15" },
  { id: "3", name: "هتل پارسیان", logo: "", category: "Hotel", city: "اصفهان", address: "خیابان چهارباغ عباسی", contact: "حسن محمدی", phone: "031-32XXXXXX", activeCampaigns: 1, completedCollabs: 22, rating: 4.8, status: "active", verified: true, submittedDate: "2025-05-01" },
  { id: "4", name: "سالن زیبایی گلدن", logo: "", category: "Beauty", city: "شیراز", address: "بلوار ارم، نبش کوچه ۱۲", contact: "زهرا عباسی", phone: "071-36XXXXXX", activeCampaigns: 2, completedCollabs: 5, rating: 4.1, status: "pending", verified: false, submittedDate: "2026-03-20" },
  { id: "5", name: "فروشگاه اسپرت لند", logo: "", category: "Sport", city: "مشهد", address: "بلوار وکیل‌آباد", contact: "کیان نیکو", phone: "051-38XXXXXX", activeCampaigns: 1, completedCollabs: 3, rating: 3.9, status: "active", verified: false, submittedDate: "2026-01-25" },
  { id: "6", name: "گالری هنر نو", logo: "", category: "Art", city: "تهران", address: "خیابان کریمخان، پلاک ۴۵", contact: "مینا شریفی", phone: "021-88XXXXXX", activeCampaigns: 0, completedCollabs: 10, rating: 4.5, status: "active", verified: true, submittedDate: "2025-04-18" },
];

export const demoCampaigns = [
  { id: "1", title: "تجربه غذایی تابستان", business: "کافه لاوندر", category: "Food", city: "تهران", dateRange: "۱۴۰۵/۰۴/۰۱ - ۱۴۰۵/۰۴/۳۰", assignedInfluencers: 5, status: "active", performance: 82, budget: "۵۰,۰۰۰,۰۰۰ ریال" },
  { id: "2", title: "معرفی منوی جدید", business: "رستوران شب‌های تهران", category: "Restaurant", city: "تهران", dateRange: "۱۴۰۵/۰۳/۱۵ - ۱۴۰۵/۰۴/۱۵", assignedInfluencers: 3, status: "active", performance: 67, budget: "۳۰,۰۰۰,۰۰۰ ریال" },
  { id: "3", title: "اقامت رایگان VIP", business: "هتل پارسیان", category: "Hotel", city: "اصفهان", dateRange: "۱۴۰۵/۰۵/۰۱ - ۱۴۰۵/۰۵/۳۱", assignedInfluencers: 2, status: "scheduled", performance: 0, budget: "۱۰۰,۰۰۰,۰۰۰ ریال" },
  { id: "4", title: "چالش زیبایی بهاره", business: "سالن زیبایی گلدن", category: "Beauty", city: "شیراز", dateRange: "۱۴۰۵/۰۱/۰۱ - ۱۴۰۵/۰۲/۳۱", assignedInfluencers: 4, status: "completed", performance: 91, budget: "۴۵,۰۰۰,۰۰۰ ریال" },
  { id: "5", title: "فروش ویژه ورزشی", business: "فروشگاه اسپرت لند", category: "Sport", city: "مشهد", dateRange: "۱۴۰۵/۰۳/۰۱ - ۱۴۰۵/۰۳/۱۵", assignedInfluencers: 2, status: "pending", performance: 0, budget: "۲۰,۰۰۰,۰۰۰ ریال" },
  { id: "6", title: "نمایشگاه هنر مدرن", business: "گالری هنر نو", category: "Art", city: "تهران", dateRange: "۱۴۰۵/۰۲/۰۱ - ۱۴۰۵/۰۲/۱۰", assignedInfluencers: 3, status: "rejected", performance: 0, budget: "۱۵,۰۰۰,۰۰۰ ریال" },
];

export const demoMeetings = [
  { id: "1", business: "کافه لاوندر", influencer: "سارا احمدی", city: "تهران", location: "ولیعصر، بالاتر از پارک ساعی", date: "2026-04-04", time: "10:00", campaign: "تجربه غذایی تابستان", status: "confirmed" },
  { id: "2", business: "رستوران شب‌های تهران", influencer: "فاطمه نوری", city: "تهران", location: "جردن، خیابان افریقا", date: "2026-04-04", time: "14:00", campaign: "معرفی منوی جدید", status: "confirmed" },
  { id: "3", business: "هتل پارسیان", influencer: "نازنین موسوی", city: "اصفهان", location: "خیابان چهارباغ عباسی", date: "2026-04-04", time: "16:00", campaign: "اقامت رایگان VIP", status: "pending" },
  { id: "4", business: "سالن زیبایی گلدن", influencer: "مریم حسینی", city: "شیراز", location: "بلوار ارم", date: "2026-04-05", time: "11:00", campaign: "چالش زیبایی بهاره", status: "confirmed" },
  { id: "5", business: "فروشگاه اسپرت لند", influencer: "رضا کریمی", city: "مشهد", location: "بلوار وکیل‌آباد", date: "2026-04-05", time: "09:30", campaign: "فروش ویژه ورزشی", status: "cancelled" },
];

export const demoActivities = [
  { id: "1", type: "registration", message: "بلاگر جدید امیر جعفری ثبت‌نام کرد", time: "۵ دقیقه پیش", icon: "user-plus" },
  { id: "2", type: "approval", message: "ادمین پروفایل سارا احمدی را تأیید کرد", time: "۱۵ دقیقه پیش", icon: "check" },
  { id: "3", type: "campaign", message: "کافه لاوندر کمپین جدید ایجاد کرد", time: "۳۰ دقیقه پیش", icon: "megaphone" },
  { id: "4", type: "review", message: "فاطمه نوری ریویو جدید ارسال کرد", time: "۱ ساعت پیش", icon: "star" },
  { id: "5", type: "message", message: "پیام جدید از هتل پارسیان", time: "۲ ساعت پیش", icon: "mail" },
  { id: "6", type: "meeting", message: "جلسه رضا کریمی با فروشگاه اسپرت لند لغو شد", time: "۳ ساعت پیش", icon: "calendar" },
  { id: "7", type: "edit", message: "رستوران شب‌های تهران اطلاعات کمپین را ویرایش کرد", time: "۴ ساعت پیش", icon: "edit" },
  { id: "8", type: "registration", message: "کسب‌وکار جدید سالن زیبایی گلدن ثبت‌نام کرد", time: "۵ ساعت پیش", icon: "building" },
];

export const demoMessages = [
  { id: "1", name: "سارا احمدی", role: "influencer", lastMessage: "سلام، درباره کمپین سوال داشتم", unread: 3, time: "۱۰:۳۰", online: true, pinned: true },
  { id: "2", name: "کافه لاوندر", role: "business", lastMessage: "گزارش هفتگی آماده است", unread: 1, time: "۰۹:۴۵", online: false, pinned: false },
  { id: "3", name: "محمد صادقی", role: "influencer", lastMessage: "ممنون از تأیید پروفایل", unread: 0, time: "دیروز", online: false, pinned: false },
  { id: "4", name: "هتل پارسیان", role: "business", lastMessage: "برنامه بازدید هفته آینده", unread: 2, time: "دیروز", online: true, pinned: true },
  { id: "5", name: "نازنین موسوی", role: "influencer", lastMessage: "تصاویر کمپین ارسال شد", unread: 0, time: "۲ روز پیش", online: false, pinned: false },
];

export const demoStaff = [
  { id: "1", name: "ادمین اصلی", email: "admin@bloggerha.com", role: "Super Admin", status: "active", lastLogin: "۱۴۰۵/۰۱/۱۵ - ۰۸:۳۰" },
  { id: "2", name: "زهرا مدیری", email: "zahra@bloggerha.com", role: "Admin", status: "active", lastLogin: "۱۴۰۵/۰۱/۱۵ - ۰۹:۱۵" },
  { id: "3", name: "حسین ناظری", email: "hossein@bloggerha.com", role: "Moderator", status: "active", lastLogin: "۱۴۰۵/۰۱/۱۴ - ۱۴:۲۰" },
  { id: "4", name: "مینا پشتیبان", email: "mina@bloggerha.com", role: "Support Agent", status: "active", lastLogin: "۱۴۰۵/۰۱/۱۵ - ۱۰:۰۰" },
  { id: "5", name: "کیان بازبین", email: "kian@bloggerha.com", role: "Reviewer", status: "inactive", lastLogin: "۱۴۰۵/۰۱/۱۰ - ۱۶:۴۵" },
];

export const categoryPerformance = [
  { name: "Food", businesses: 45, influencers: 120, campaigns: 38, engagement: 4.5 },
  { name: "Cafe", businesses: 32, influencers: 85, campaigns: 25, engagement: 4.2 },
  { name: "Hotel", businesses: 18, influencers: 40, campaigns: 15, engagement: 4.8 },
  { name: "Beauty", businesses: 28, influencers: 95, campaigns: 30, engagement: 4.1 },
  { name: "Fashion", businesses: 22, influencers: 110, campaigns: 28, engagement: 3.9 },
  { name: "Sport", businesses: 15, influencers: 35, campaigns: 12, engagement: 5.0 },
  { name: "Art", businesses: 12, influencers: 25, campaigns: 8, engagement: 4.6 },
  { name: "Cinema", businesses: 8, influencers: 20, campaigns: 5, engagement: 3.8 },
];

export const registrationChartData = [
  { date: "فروردین", influencers: 45, businesses: 12 },
  { date: "اردیبهشت", influencers: 52, businesses: 18 },
  { date: "خرداد", influencers: 61, businesses: 22 },
  { date: "تیر", influencers: 78, businesses: 28 },
  { date: "مرداد", influencers: 85, businesses: 32 },
  { date: "شهریور", influencers: 92, businesses: 35 },
];

export const campaignChartData = [
  { date: "فروردین", active: 8, completed: 3 },
  { date: "اردیبهشت", active: 12, completed: 6 },
  { date: "خرداد", active: 15, completed: 10 },
  { date: "تیر", active: 20, completed: 14 },
  { date: "مرداد", active: 18, completed: 18 },
  { date: "شهریور", active: 22, completed: 20 },
];
