export const flights = [
  { id: "BS-101", flight: "BS-101", sector: "DAC-CGP", aircraft: "ATR 72-600", dep: "08:30", arr: "09:30", pax: 68, adult: 60, child: 6, infant: 2, crew: 4, type: "Domestic", window: "Breakfast", duration: "1h 0m", status: "Scheduled" },
  { id: "BS-203", flight: "BS-203", sector: "DAC-DXB", aircraft: "B737-800", dep: "12:15", arr: "16:45", pax: 168, adult: 150, child: 14, infant: 4, crew: 8, type: "International", window: "Lunch", duration: "4h 30m", status: "Boarding" },
  { id: "BS-307", flight: "BS-307", sector: "DAC-KUL", aircraft: "A330-300", dep: "23:50", arr: "06:20", pax: 282, adult: 260, child: 18, infant: 4, crew: 12, type: "International", window: "Dinner", duration: "5h 30m", status: "Scheduled" },
  { id: "BS-141", flight: "BS-141", sector: "DAC-CXB", aircraft: "DASH 8", dep: "10:00", arr: "11:05", pax: 72, adult: 65, child: 5, infant: 2, crew: 4, type: "Domestic", window: "Snack", duration: "1h 5m", status: "Departed" },
  { id: "BS-225", flight: "BS-225", sector: "DAC-DOH", aircraft: "B737 MAX 8", dep: "15:40", arr: "19:10", pax: 174, adult: 158, child: 12, infant: 4, crew: 8, type: "International", window: "Snack", duration: "4h 30m", status: "Delayed" },
  { id: "BS-117", flight: "BS-117", sector: "DAC-SYL", aircraft: "ATR 72-600", dep: "07:00", arr: "07:50", pax: 64, adult: 58, child: 5, infant: 1, crew: 4, type: "Domestic", window: "Breakfast", duration: "0h 50m", status: "Scheduled" },
  { id: "BS-411", flight: "BS-411", sector: "CGP-DXB", aircraft: "B737-800", dep: "18:25", arr: "22:10", pax: 162, adult: 144, child: 14, infant: 4, crew: 8, type: "International", window: "Dinner", duration: "5h 15m", status: "Scheduled" },
];

export const inventory = [
  { id: "INV-1001", name: "Basmati Rice", category: "Grains", uom: "Kg", stock: 480, reorder: 200, batch: "BR-2406", expiry: "2026-09-30", storage: "Dry", status: "OK" },
  { id: "INV-1002", name: "Chicken Breast", category: "Protein", uom: "Kg", stock: 64, reorder: 100, batch: "CB-2511", expiry: "2025-11-12", storage: "Cold", status: "Low" },
  { id: "INV-1003", name: "Mineral Water 250ml", category: "Beverage", uom: "Bottle", stock: 4200, reorder: 1500, batch: "MW-2606", expiry: "2027-06-01", storage: "Dry", status: "OK" },
  { id: "INV-1004", name: "Butter Salted", category: "Dairy", uom: "Kg", stock: 38, reorder: 30, batch: "BT-2510", expiry: "2025-12-20", storage: "Cold", status: "OK" },
  { id: "INV-1005", name: "Tomato", category: "Vegetable", uom: "Kg", stock: 22, reorder: 80, batch: "TM-2511", expiry: "2025-11-15", storage: "Cold", status: "Critical" },
  { id: "INV-1006", name: "Wheat Flour", category: "Grains", uom: "Kg", stock: 320, reorder: 150, batch: "WF-2509", expiry: "2026-08-10", storage: "Dry", status: "OK" },
  { id: "INV-1007", name: "Olive Oil", category: "Oil", uom: "Litre", stock: 58, reorder: 40, batch: "OO-2507", expiry: "2026-07-22", storage: "Dry", status: "OK" },
  { id: "INV-1008", name: "Salmon Fillet", category: "Protein", uom: "Kg", stock: 12, reorder: 30, batch: "SL-2511", expiry: "2025-11-09", storage: "Frozen", status: "Critical" },
];

export const purchaseOrders = [
  { id: "PO-2025-0451", vendor: "Fresh Farms Ltd", items: 12, amount: 248500, date: "2025-11-04", status: "Pending Approval" },
  { id: "PO-2025-0450", vendor: "Halal Meats Co.", items: 6, amount: 184000, date: "2025-11-03", status: "Approved" },
  { id: "PO-2025-0449", vendor: "Aqua Pure BD", items: 3, amount: 92000, date: "2025-11-03", status: "Delivered" },
  { id: "PO-2025-0448", vendor: "Spice World", items: 18, amount: 64200, date: "2025-11-02", status: "Ordered" },
  { id: "PO-2025-0447", vendor: "Dhaka Dairy", items: 4, amount: 38500, date: "2025-11-02", status: "Closed" },
  { id: "PO-2025-0446", vendor: "Royal Bakery Supplies", items: 9, amount: 122700, date: "2025-11-01", status: "Draft" },
];

export const demandRequests = [
  {
    id: "DR-9001",
    reference: "BS-203 Meal Plan",
    requestedBy: "A. Khan",
    role: "Flight Kitchen Executive",
    date: "2025-11-05 09:45",
    status: "Pending Store Review",
    items: [
      { id: "INV-1002", name: "Chicken Breast", qty: 80, uom: "Kg", type: "Perishable" },
      { id: "INV-1005", name: "Tomato", qty: 110, uom: "Kg", type: "Perishable" },
      { id: "INV-1008", name: "Salmon Fillet", qty: 28, uom: "Kg", type: "Frozen" },
    ],
    note: "Advance kitchen request for 96-hour meal block, day-wise order planning.",
  },
  {
    id: "DR-9002",
    reference: "BS-307 Special Meals",
    requestedBy: "N. Hasan",
    role: "Flight Kitchen Executive",
    date: "2025-11-05 10:15",
    status: "Sent to Supply Chain",
    items: [
      { id: "INV-1001", name: "Basmati Rice", qty: 150, uom: "Kg", type: "Dry" },
      { id: "INV-1005", name: "Tomato", qty: 65, uom: "Kg", type: "Perishable" },
      { id: "INV-1003", name: "Mineral Water 250ml", qty: 600, uom: "Bottle", type: "Dry" },
    ],
    note: "Store will review and send purchase requisition for low stock items.",
  },
];

export const requisitions = [
  {
    id: "REQ-1101",
    source: "Store",
    reference: "DR-9001",
    items: 3,
    status: "Pending Accounts",
    requestedBy: "S. Ahmed",
    date: "2025-11-05 11:20",
    note: "Need vendor selection and PO creation for kitchen replenishment.",
  },
  {
    id: "REQ-1102",
    source: "Store",
    reference: "DR-9002",
    items: 3,
    status: "Approved",
    requestedBy: "M. Karim",
    date: "2025-11-05 12:05",
    note: "Fresh produce requisition for immediate kitchen stock restock.",
  },
];

export const hygieneChecks = [
  { id: "HM-001", time: "06:00", activity: "All plastic curtains are in good position", status: "Completed", remarks: "Curtains checked at loading bay." },
  { id: "HM-002", time: "08:00", activity: "All aircutters are working properly", status: "Completed", remarks: "Aircutters operating as required." },
  { id: "HM-003", time: "10:00", activity: "Wastage has been disposed properly", status: "Completed", remarks: "Waste bins cleared." },
  { id: "HM-004", time: "12:00", activity: "All cooking utensils are clean & good condition", status: "Completed", remarks: "Utensils washed and stored." },
  { id: "HM-005", time: "14:00", activity: "Any food item kept in danger zone", status: "Pending", remarks: "Monitor temperature in hot hold." },
  { id: "HM-006", time: "16:00", activity: "All chiller/freezer/AC working properly", status: "Completed", remarks: "Chiller stable at 4°C." },
  { id: "HM-007", time: "18:00", activity: "Raw & cooked food kept seperatly in Kitchen/Chiller/freezer", status: "Completed", remarks: "Segregation maintained." },
  { id: "HM-008", time: "20:00", activity: "Maintaining FIFO properly in Kitchen/Chiller/Freezer/Pack/Bakery", status: "Completed", remarks: "FIFO labels verified." },
  { id: "HM-009", time: "22:00", activity: "All open food are covered properly with Date code in Kitchen/Chiller/Freezer/Pack/Bakery", status: "Completed", remarks: "Dated and covered." },
  { id: "HM-010", time: "06:00", activity: "Any expired/spoiled product found Kitchen/Chiller/Freezer/Pack/Bakery", status: "Completed", remarks: "No spoiled items found." },
  { id: "HM-011", time: "08:00", activity: "Any Cooked food, RM/PM are kept directly on the floor", status: "Pending", remarks: "Floor placement inspected." },
  { id: "HM-012", time: "10:00", activity: "Packaging room temp. is below 15°C", status: "Completed", remarks: "Room at 13.8°C." },
  { id: "HM-013", time: "12:00", activity: "Date code check in packaging room", status: "Completed", remarks: "Date codes are correct." },
  { id: "HM-014", time: "14:00", activity: "Meal PKT Holding inside packaging room (Max. 10 Baskets)", status: "Completed", remarks: "5 baskets in use." },
  { id: "HM-015", time: "16:00", activity: "Presence of any pest/insects", status: "Completed", remarks: "Inspection clear." },
];

export const meals = [
  { id: "ML-001", name: "Chicken Biryani", type: "Lunch", calories: 720, portion: "350g", category: "Hot", status: "Approved", serviceGroup: "Passenger", menuStandard: "KML" },
  { id: "ML-002", name: "Veg Pulao", type: "Lunch", calories: 540, portion: "320g", category: "Hot", status: "Approved", serviceGroup: "Passenger", menuStandard: "VGML" },
  { id: "ML-003", name: "Continental Breakfast", type: "Breakfast", calories: 480, portion: "Set", category: "Cold", status: "Approved", serviceGroup: "Passenger", menuStandard: "KML" },
  { id: "ML-004", name: "Grilled Salmon", type: "Dinner", calories: 610, portion: "300g", category: "Hot", status: "Draft", serviceGroup: "Passenger", menuStandard: "CHML" },
  { id: "ML-005", name: "Hindu Meal Special", type: "Lunch", calories: 590, portion: "330g", category: "Special", status: "Approved", serviceGroup: "Passenger", menuStandard: "VGML" },
  { id: "ML-006", name: "Diabetic Meal", type: "Dinner", calories: 420, portion: "300g", category: "Special", status: "Approved", serviceGroup: "Passenger", menuStandard: "KML" },
  { id: "ML-007", name: "Kids Pasta", type: "Snacks", calories: 380, portion: "220g", category: "Child", status: "Approved", serviceGroup: "Passenger", menuStandard: "KML" },
  { id: "ML-008", name: "Crew Combo Meal", type: "H.Snacks", calories: 680, portion: "Set", category: "Crew", status: "Approved", serviceGroup: "Crew", menuStandard: "KML" },
  { id: "ML-009", name: "Vegetable Sandwich", type: "Breakfast", calories: 320, portion: "1 pcs", category: "Cold", status: "Approved", serviceGroup: "Crew", menuStandard: "KML" },
  { id: "ML-010", name: "Chicken Wrap", type: "Snacks", calories: 450, portion: "1 pcs", category: "Hot", status: "Approved", serviceGroup: "Crew", menuStandard: "CHML" },
  { id: "ML-011", name: "Fruit Platter", type: "Snacks", calories: 260, portion: "150g", category: "Cold", status: "Approved", serviceGroup: "Passenger", menuStandard: "VGML" },
  { id: "ML-012", name: "Tea & Biscuit", type: "H.Snacks", calories: 180, portion: "Set", category: "Beverage", status: "Approved", serviceGroup: "Crew", menuStandard: "KML" },
];

export const mealOrders = [
  { id: "MO-1001", date: "2025-11-05", flight: "BS-203", serviceGroup: "Passenger", menuStandard: "KML", mealType: "Lunch", items: 168, calories: 720, status: "Confirmed", note: "BS-203 lunch order" },
  { id: "MO-1002", date: "2025-11-05", flight: "BS-307", serviceGroup: "Passenger", menuStandard: "CHML", mealType: "Dinner", items: 282, calories: 610, status: "Confirmed", note: "BS-307 dinner order" },
  { id: "MO-1003", date: "2025-11-06", flight: "BS-101", serviceGroup: "Passenger", menuStandard: "KML", mealType: "Breakfast", items: 68, calories: 480, status: "Confirmed", note: "BS-101 breakfast order" },
  { id: "MO-1004", date: "2025-11-06", flight: "BS-203", serviceGroup: "Crew", menuStandard: "KML", mealType: "H.Snacks", items: 8, calories: 680, status: "Confirmed", note: "Crew snack order" },
];

export const productionOrders = [
  { id: "PRD-9001", flight: "BS-203", meal: "Chicken Biryani", qty: 168, section: "Hot Kitchen", status: "Cooking", progress: 65 },
  { id: "PRD-9002", flight: "BS-203", meal: "Veg Pulao", qty: 24, section: "Veg Section", status: "Ready for QC", progress: 100 },
  { id: "PRD-9003", flight: "BS-307", meal: "Grilled Salmon", qty: 282, section: "Hot Kitchen", status: "In Preparation", progress: 30 },
  { id: "PRD-9004", flight: "BS-307", meal: "Continental Breakfast", qty: 282, section: "Cold Kitchen", status: "Pending", progress: 0 },
  { id: "PRD-9005", flight: "BS-101", meal: "Hindu Meal Special", qty: 8, section: "Special Meal", status: "Approved", progress: 100 },
  { id: "PRD-9006", flight: "BS-225", meal: "Heavy Snack Box", qty: 174, section: "Cold Kitchen", status: "Sent to Packaging", progress: 100 },
];

export const bakeryOrders = [
  { id: "BK-501", item: "Sourdough Bread", qty: 220, oven: "Oven-1", batch: "B-22", yield: "98%", status: "Baking" },
  { id: "BK-502", item: "Butter Croissant", qty: 480, oven: "Oven-3", batch: "B-23", yield: "96%", status: "Cooling" },
  { id: "BK-503", item: "Chocolate Muffin", qty: 320, oven: "Oven-2", batch: "B-24", yield: "99%", status: "Ready" },
  { id: "BK-504", item: "Vanilla Cake Slice", qty: 180, oven: "Oven-4", batch: "B-25", yield: "97%", status: "Pending" },
  { id: "BK-505", item: "Cheese Pastry", qty: 260, oven: "Oven-1", batch: "B-26", yield: "95%", status: "Baking" },
];

export const dispatch = [
  { id: "DSP-7701", flight: "BS-101", trays: 72, carts: 4, vehicle: "HiLoader-02", driver: "M. Karim", status: "Loaded" },
  { id: "DSP-7702", flight: "BS-203", trays: 176, carts: 9, vehicle: "HiLoader-05", driver: "R. Hossain", status: "En Route" },
  { id: "DSP-7703", flight: "BS-141", trays: 76, carts: 4, vehicle: "Van-11", driver: "S. Ahmed", status: "Delivered" },
  { id: "DSP-7704", flight: "BS-225", trays: 182, carts: 9, vehicle: "HiLoader-03", driver: "T. Rahman", status: "Preparing" },
];

export const qcChecks = [
  { id: "QC-3301", flight: "BS-203", batch: "PRD-9001", parameter: "Core Temperature", value: "74°C", limit: ">70°C", result: "Pass", inspector: "F. Begum" },
  { id: "QC-3302", flight: "BS-307", batch: "PRD-9003", parameter: "pH Level", value: "5.8", limit: "5.5-6.5", result: "Pass", inspector: "F. Begum" },
  { id: "QC-3303", flight: "BS-225", batch: "PRD-9006", parameter: "Visual Inspection", value: "Discoloration", limit: "Clean", result: "Fail", inspector: "A. Khan" },
  { id: "QC-3304", flight: "BS-101", batch: "PRD-9005", parameter: "Hygiene Audit", value: "98/100", limit: ">90", result: "Pass", inspector: "A. Khan" },
];

export const vendors = [
  { id: "V-001", name: "Fresh Farms Ltd", category: "Vegetables", rating: 4.7, orders: 142, onTime: "96%" },
  { id: "V-002", name: "Halal Meats Co.", category: "Protein", rating: 4.8, orders: 96, onTime: "98%" },
  { id: "V-003", name: "Aqua Pure BD", category: "Beverage", rating: 4.5, orders: 64, onTime: "94%" },
  { id: "V-004", name: "Spice World", category: "Spices", rating: 4.3, orders: 38, onTime: "89%" },
  { id: "V-005", name: "Royal Bakery Supplies", category: "Bakery", rating: 4.6, orders: 72, onTime: "92%" },
];

export const assets = [
  { id: "AS-101", name: "Convection Oven #1", type: "Oven", location: "Hot Kitchen", lastSvc: "2025-09-15", nextSvc: "2025-12-15", status: "Operational" },
  { id: "AS-102", name: "Walk-in Chiller A", type: "Chiller", location: "Cold Storage", lastSvc: "2025-10-01", nextSvc: "2026-01-01", status: "Operational" },
  { id: "AS-103", name: "Generator 250KVA", type: "Generator", location: "Utility", lastSvc: "2025-08-20", nextSvc: "2025-11-20", status: "Service Due" },
  { id: "AS-104", name: "HiLoader Truck #5", type: "Vehicle", location: "Dispatch", lastSvc: "2025-10-10", nextSvc: "2026-01-10", status: "Operational" },
  { id: "AS-105", name: "Blast Freezer", type: "Freezer", location: "Cold Storage", lastSvc: "2025-07-12", nextSvc: "2025-10-12", status: "Maintenance" },
];

export const visitors = [
  { id: "VIS-441", name: "Imran Hossain", company: "FDA Bangladesh", purpose: "Audit", entry: "09:14", exit: "12:30", badge: "V-09", status: "Exited" },
  { id: "VIS-442", name: "Shahin Akhter", company: "Fresh Farms Ltd", purpose: "Delivery", entry: "10:02", exit: "-", badge: "V-12", status: "Inside" },
  { id: "VIS-443", name: "Capt. R. Islam", company: "US-Bangla Ops", purpose: "Inspection", entry: "11:20", exit: "-", badge: "V-15", status: "Inside" },
];

export const recentUploads = [
  { id: "UP-2210", file: "manifest_2025-11-05.xlsx", rows: 124, valid: 122, errors: 2, by: "ops.user", at: "2025-11-05 06:12", status: "Imported" },
  { id: "UP-2209", file: "BS-307_passengers.csv", rows: 282, valid: 282, errors: 0, by: "ops.user", at: "2025-11-04 22:45", status: "Imported" },
  { id: "UP-2208", file: "weekly_manifest.xlsx", rows: 1840, valid: 1818, errors: 22, by: "ops.admin", at: "2025-11-04 09:30", status: "Partial" },
  { id: "UP-2207", file: "BS-141_special_meals.docx", rows: 18, valid: 0, errors: 18, by: "ops.user", at: "2025-11-03 14:10", status: "Failed" },
];

export const amenitiesMedicine = [
  { id: "AM-MED-01", item: "Paracetamol 500mg", brand: "Square", uom: "Strip", stock: 220, reorder: 100, status: "OK" },
  { id: "AM-MED-02", item: "Antacid Tablet", brand: "Beximco", uom: "Strip", stock: 180, reorder: 80, status: "OK" },
  { id: "AM-MED-03", item: "Motion Sickness Tab", brand: "ACI", uom: "Strip", stock: 64, reorder: 80, status: "Low" },
  { id: "AM-MED-04", item: "Adhesive Bandage", brand: "Hansaplast", uom: "Box", stock: 42, reorder: 30, status: "OK" },
  { id: "AM-MED-05", item: "Antiseptic Wipe", brand: "Savlon", uom: "Pack", stock: 18, reorder: 50, status: "Critical" },
  { id: "AM-MED-06", item: "ORS Sachet", brand: "SMC", uom: "Sachet", stock: 320, reorder: 200, status: "OK" },
];

export const amenitiesTissue = [
  { id: "AM-TIS-01", item: "Wet Hand Towel (Refresh)", uom: "Pcs", stock: 4800, reorder: 2000, status: "OK" },
  { id: "AM-TIS-02", item: "Facial Tissue 100s", uom: "Box", stock: 240, reorder: 150, status: "OK" },
  { id: "AM-TIS-03", item: "Dinner Napkin (B-class)", uom: "Pcs", stock: 1200, reorder: 1500, status: "Low" },
  { id: "AM-TIS-04", item: "Dinner Napkin (Y-class)", uom: "Pcs", stock: 6400, reorder: 3000, status: "OK" },
  { id: "AM-TIS-05", item: "Cocktail Napkin", uom: "Pcs", stock: 980, reorder: 1200, status: "Low" },
];

export const amenitiesCutlery = [
  { id: "AM-CUT-01", item: "Plastic Spoon (Heavy Duty)", uom: "Pcs", stock: 8400, reorder: 4000, status: "OK" },
  { id: "AM-CUT-02", item: "Plastic Fork", uom: "Pcs", stock: 7800, reorder: 4000, status: "OK" },
  { id: "AM-CUT-03", item: "Plastic Knife", uom: "Pcs", stock: 3600, reorder: 4000, status: "Low" },
  { id: "AM-CUT-04", item: "Wooden Stirrer", uom: "Pcs", stock: 12400, reorder: 5000, status: "OK" },
  { id: "AM-CUT-05", item: "Stainless Spoon (Business)", uom: "Pcs", stock: 480, reorder: 200, status: "OK" },
  { id: "AM-CUT-06", item: "Disposable Cup 180ml", uom: "Pcs", stock: 2100, reorder: 3000, status: "Critical" },
];

export const receiveItems = [
  { id: "GRN-5501", po: "PO-2025-0450", vendor: "Halal Meats Co.", item: "Chicken Breast", qty: 120, uom: "Kg", temp: "3°C", expiry: "2025-11-18", receivedBy: "M. Karim", status: "Accepted" },
  { id: "GRN-5502", po: "PO-2025-0449", vendor: "Aqua Pure BD", item: "Mineral Water 250ml", qty: 2400, uom: "Bottle", temp: "Ambient", expiry: "2027-06-01", receivedBy: "M. Karim", status: "Accepted" },
  { id: "GRN-5503", po: "PO-2025-0451", vendor: "Fresh Farms Ltd", item: "Tomato", qty: 80, uom: "Kg", temp: "8°C", expiry: "2025-11-12", receivedBy: "S. Ahmed", status: "On Hold" },
  { id: "GRN-5504", po: "PO-2025-0448", vendor: "Spice World", item: "Cumin Powder", qty: 22, uom: "Kg", temp: "Ambient", expiry: "2026-08-30", receivedBy: "S. Ahmed", status: "Accepted" },
  { id: "GRN-5505", po: "PO-2025-0451", vendor: "Fresh Farms Ltd", item: "Lettuce", qty: 35, uom: "Kg", temp: "12°C", expiry: "2025-11-08", receivedBy: "F. Begum", status: "Rejected" },
  { id: "GRN-5506", po: "PO-2025-0447", vendor: "Dhaka Dairy", item: "Butter Salted", qty: 30, uom: "Kg", temp: "4°C", expiry: "2025-12-20", receivedBy: "F. Begum", status: "Accepted" },
];

export const cookingTempLogs = [
  { id: "CT-8801", batch: "PRD-9001", item: "Chicken Biryani", cookingTime: "45 min", standardTemp: "≥75°C", standardTempMin: 75, measuredTemp: 78, cookedBy: "Chef R. Karim", sensoryPass: true, checkedBy: "F. Begum" },
  { id: "CT-8802", batch: "PRD-9002", item: "Veg Pulao", cookingTime: "30 min", standardTemp: "≥70°C", standardTempMin: 70, measuredTemp: 73, cookedBy: "Chef N. Hasan", sensoryPass: true, checkedBy: "F. Begum" },
  { id: "CT-8803", batch: "PRD-9003", item: "Grilled Salmon", cookingTime: "18 min", standardTemp: "≥63°C", standardTempMin: 63, measuredTemp: 68, cookedBy: "Chef A. Rahim", sensoryPass: true, checkedBy: "A. Khan" },
  { id: "CT-8804", batch: "PRD-9004", item: "Continental Breakfast", cookingTime: "12 min", standardTemp: "≥65°C", standardTempMin: 65, measuredTemp: 60, cookedBy: "Chef T. Hossain", sensoryPass: false, checkedBy: "A. Khan" },
  { id: "CT-8805", batch: "PRD-9005", item: "Hindu Meal Special", cookingTime: "40 min", standardTemp: "≥75°C", standardTempMin: 75, measuredTemp: 76, cookedBy: "Chef S. Mahmud", sensoryPass: true, checkedBy: "F. Begum" },
  { id: "CT-8806", batch: "PRD-9006", item: "Heavy Snack Box", cookingTime: "20 min", standardTemp: "≥70°C", standardTempMin: 70, measuredTemp: 72, cookedBy: "Chef N. Hasan", sensoryPass: true, checkedBy: "A. Khan" },
];

export const billOfMaterials = [
  { id: "BOM-001", name: "Chicken Biryani",        components: 9,  version: "v3.2", yield: "100 portions", lastUpdated: "2025-10-22", status: "Active" },
  { id: "BOM-002", name: "Veg Pulao",              components: 7,  version: "v2.1", yield: "100 portions", lastUpdated: "2025-09-15", status: "Active" },
  { id: "BOM-003", name: "Continental Breakfast",  components: 11, version: "v1.4", yield: "Set",          lastUpdated: "2025-10-30", status: "Active" },
  { id: "BOM-004", name: "Grilled Salmon",         components: 8,  version: "v1.0", yield: "100 portions", lastUpdated: "2025-11-01", status: "Draft"  },
  { id: "BOM-005", name: "Hindu Meal Special",     components: 10, version: "v2.0", yield: "50 portions",  lastUpdated: "2025-10-12", status: "Active" },
  { id: "BOM-006", name: "Crew Combo Meal",        components: 6,  version: "v1.2", yield: "Set",          lastUpdated: "2025-08-28", status: "Active" },
];

const bomAt = (i: number) => billOfMaterials[i % billOfMaterials.length].name;

export const seedProductionEntries = [
  { id: "PE-2026-000031", date: "2026-05-19", bom: bomAt(0), producedQty: 280, status: "In Preparation" },
  { id: "PE-2026-000030", date: "2026-05-18", bom: bomAt(2), producedQty: 150, status: "Ready for QC"   },
  { id: "PE-2026-000029", date: "2026-05-17", bom: bomAt(1), producedQty: 320, status: "Approved"       },
  { id: "PE-2026-000028", date: "2026-05-12", bom: bomAt(0), producedQty: 250, status: "Closed"         },
  { id: "PE-2026-000025", date: "2026-05-10", bom: bomAt(1), producedQty: 180, status: "Closed"         },
  { id: "PE-2026-000022", date: "2026-05-08", bom: bomAt(2), producedQty: 220, status: "Closed"         },
  { id: "PE-2026-000019", date: "2026-05-05", bom: bomAt(3), producedQty: 130, status: "Closed"         },
  { id: "PE-2026-000016", date: "2026-05-02", bom: bomAt(4), producedQty: 80,  status: "Closed"         },
  { id: "PE-2026-000013", date: "2026-04-28", bom: bomAt(5), producedQty: 95,  status: "Closed"         },
  { id: "PE-2026-000010", date: "2026-04-25", bom: bomAt(0), producedQty: 310, status: "Closed"         },
  { id: "PE-2026-000007", date: "2026-04-22", bom: bomAt(1), producedQty: 160, status: "Closed"         },
  { id: "PE-2026-000004", date: "2026-04-18", bom: bomAt(2), producedQty: 200, status: "Closed"         },
  { id: "PE-2026-000001", date: "2026-04-15", bom: bomAt(3), producedQty: 140, status: "Closed"         },
];

export type ProductionEntryRow = (typeof seedProductionEntries)[number];

export const seedFlightOrders = [
  { id: "ORD-3411", flight: "BG-401", airline: "Air Astra",  sector: "DAC → DXB", date: "2026-05-20", etd: "10:30", pax: 186, crew: 14, specialMeals: 12, status: "Dispatched" },
  { id: "ORD-3412", flight: "BG-522", airline: "Air Astra",  sector: "DAC → LHR", date: "2026-05-20", etd: "14:45", pax: 214, crew: 18, specialMeals: 18, status: "Production" },
  { id: "ORD-3413", flight: "VQ-901", airline: "US-Bangla",  sector: "DAC → KUL", date: "2026-05-20", etd: "16:20", pax: 162, crew: 12, specialMeals: 8,  status: "Production" },
  { id: "ORD-3414", flight: "BS-203", airline: "US-Bangla",  sector: "DAC → DOH", date: "2026-05-21", etd: "18:10", pax: 168, crew: 14, specialMeals: 10, status: "Pending"    },
  { id: "ORD-3415", flight: "BS-307", airline: "US-Bangla",  sector: "DAC → BKK", date: "2026-05-21", etd: "20:00", pax: 282, crew: 16, specialMeals: 22, status: "Pending"    },
];

export type FlightOrderRow = (typeof seedFlightOrders)[number];
