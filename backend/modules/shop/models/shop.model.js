import mongoose from "mongoose";
import slugify from "slugify";

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ek user ki ek hi dukan
    },
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
    },
    // Ye slug hi custom dukan URL banata hai -> /shop/:slug
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    description: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    contactPhone: String,
    contactEmail: String,
    // Day-wise open/close time. Times stored as "HH:mm" 24-hour strings.
    // isClosed = true means the shop is closed that entire day (e.g. weekly off).
    businessHours: {
      monday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
      tuesday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
      wednesday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
      thursday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
      friday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
      saturday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
      sunday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" },
        isClosed: { type: Boolean, default: false },
      },
    },
    // Specific calendar dates the shop is closed (festivals, holidays) - "YYYY-MM-DD" strings
    holidayDates: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Auto-generate slug from shopName if not provided, and ensure uniqueness
shopSchema.pre("validate", async function (next) {
  if (!this.slug && this.shopName) {
    const baseSlug = slugify(this.shopName, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

    const Shop = mongoose.model("Shop");
    while (await Shop.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count}`;
      count += 1;
    }
    this.slug = slug;
  }
  next();
});

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Instance method - calculates whether the shop is open right now
// Accepts an optional `date` (defaults to current time), and an optional `timezone`
// offset in minutes (e.g. IST = 330) since the server may run in a different timezone.
shopSchema.methods.isCurrentlyOpen = function (referenceDate = new Date()) {
  const todayStr = referenceDate.toISOString().slice(0, 10); // "YYYY-MM-DD"

  if (this.holidayDates?.includes(todayStr)) {
    return false;
  }

  const dayName = DAY_NAMES[referenceDate.getDay()];
  const todayHours = this.businessHours?.[dayName];

  if (!todayHours || todayHours.isClosed) {
    return false;
  }

  const currentMinutes =
    referenceDate.getHours() * 60 + referenceDate.getMinutes();

  const [openHour, openMin] = todayHours.open.split(":").map(Number);
  const [closeHour, closeMin] = todayHours.close.split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
