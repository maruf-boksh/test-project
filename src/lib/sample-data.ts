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

export type BomProductionItem = {
  item: string;
  itemType: string;
  netWeight: number;
  quantity: number;
  costPct: number;
};

export type BomInputMaterial = {
  material: string;
  type: string;
  excludeScrap: "Yes" | "No";
  altQty: number;
  altUom?: string;
  quantity: number;
  uom: string;
  wastagePct: number;
  totalQty: number;
  avgRate: number;
  total: number;
};

export type BillOfMaterial = {
  id: string;
  name: string;
  components: number;
  version: string;
  yield: string;
  lastUpdated: string;
  status: string;
  date: string;
  itemCode: string;
  itemName: string;
  department: string;
  section: string;
  uom: string;
  altUom?: string;
  lotSize: number;
  bomValue: number;
  createdBy: string;
  bomType: "Single Output" | "Multi Output";
  productionItems: BomProductionItem[];
  inputMaterials: BomInputMaterial[];
  officeId?: string;
  warehouseId?: string;
};

const _billOfMaterialsRaw: BillOfMaterial[] = [
  {
    id: "BOM-001", name: "Chicken Biryani", components: 9, version: "v3.2",
    yield: "100 portions", lastUpdated: "2025-10-22", status: "Active",
    date: "2026-05-20", itemCode: "FG-27041", itemName: "Chicken Biryani",
    department: "Hot Kitchen", section: "Main Course", uom: "PCS", altUom: "",
    lotSize: 1, bomValue: 40.00, createdBy: "Md. Mubin Khan",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-27041 - Chicken Biryani (PCS)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27042 - Basmati Rice (KG)", type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 2, uom: "KG", wastagePct: 0, totalQty: 2, avgRate: 10, total: 20 },
      { material: "RM-27043 - Chicken (KG)",      type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 1, uom: "KG", wastagePct: 0, totalQty: 1, avgRate: 20, total: 20 },
    ],
  },
  {
    id: "BOM-002", name: "Veg Pulao", components: 7, version: "v2.1",
    yield: "100 portions", lastUpdated: "2025-09-15", status: "Active",
    date: "2026-05-10", itemCode: "FG-27036", itemName: "Veg Pulao",
    department: "Hot Kitchen", section: "Main Course", uom: "pieces", altUom: "",
    lotSize: 1, bomValue: 21.50, createdBy: "Raisa Zarin",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-27036 - Veg Pulao (pieces)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27044 - Rice (KG)",  type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 1.5, uom: "KG", wastagePct: 0,  totalQty: 1.5, avgRate: 9,  total: 13.50 },
      { material: "RM-27045 - Mixed Veg (KG)", type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.8, uom: "KG", wastagePct: 0, totalQty: 0.8, avgRate: 10, total: 8.00 },
    ],
  },
  {
    id: "BOM-003", name: "Continental Breakfast", components: 11, version: "v1.4",
    yield: "Set", lastUpdated: "2025-10-30", status: "Active",
    date: "2026-05-10", itemCode: "FG-27037", itemName: "Continental Breakfast",
    department: "Cold Kitchen", section: "Breakfast", uom: "pieces", altUom: "",
    lotSize: 1, bomValue: 82.18, createdBy: "Shovon Ahmed Rajib",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-27037 - Continental Breakfast (pieces)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27050 - Bread (PCS)",   type: "Raw Material", excludeScrap: "No",  altQty: 0, quantity: 2, uom: "PCS", wastagePct: 0, totalQty: 2, avgRate: 5,  total: 10.00 },
      { material: "RM-27051 - Butter (KG)",   type: "Raw Material", excludeScrap: "No",  altQty: 0, quantity: 0.05, uom: "KG", wastagePct: 0, totalQty: 0.05, avgRate: 950, total: 47.50 },
      { material: "RM-27052 - Jam (KG)",      type: "Raw Material", excludeScrap: "Yes", altQty: 0, quantity: 0.03, uom: "KG", wastagePct: 0, totalQty: 0.03, avgRate: 820, total: 24.68 },
    ],
  },
  {
    id: "BOM-004", name: "Grilled Salmon", components: 8, version: "v1.0",
    yield: "100 portions", lastUpdated: "2025-11-01", status: "Draft",
    date: "2026-04-30", itemCode: "FG-27021", itemName: "Grilled Salmon",
    department: "Hot Kitchen", section: "Main Course", uom: "pieces", altUom: "",
    lotSize: 1, bomValue: 246.80, createdBy: "Md. Saidur Rahman Akash",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-27021 - Grilled Salmon (pieces)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27060 - Salmon Fillet (KG)", type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.15, uom: "KG", wastagePct: 5, totalQty: 0.1575, avgRate: 1400, total: 220.50 },
      { material: "RM-27061 - Olive Oil (Litre)",   type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.02, uom: "Litre", wastagePct: 0, totalQty: 0.02, avgRate: 850, total: 17.00 },
      { material: "RM-27062 - Lemon (KG)",          type: "Raw Material", excludeScrap: "Yes", altQty: 0, quantity: 0.05, uom: "KG", wastagePct: 0, totalQty: 0.05, avgRate: 186, total: 9.30 },
    ],
  },
  {
    id: "BOM-005", name: "Hindu Meal Special", components: 10, version: "v2.0",
    yield: "50 portions", lastUpdated: "2025-10-12", status: "Active",
    date: "2026-04-23", itemCode: "FG-1010", itemName: "Hindu Meal Special",
    department: "Special Meal", section: "Religious", uom: "Packet", altUom: "",
    lotSize: 10, bomValue: 285.00, createdBy: "Md. Saidur Rahman Akash",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-1010 - Hindu Meal Special (Packet)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 10, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27070 - Paneer (KG)",     type: "Raw Material", excludeScrap: "No",  altQty: 0, quantity: 1,   uom: "KG", wastagePct: 0, totalQty: 1,   avgRate: 180, total: 180.00 },
      { material: "RM-27071 - Mixed Veg (KG)",  type: "Raw Material", excludeScrap: "No",  altQty: 0, quantity: 0.8, uom: "KG", wastagePct: 0, totalQty: 0.8, avgRate: 90,  total: 72.00 },
      { material: "RM-27072 - Spice Mix (KG)",  type: "Raw Material", excludeScrap: "Yes", altQty: 0, quantity: 0.1, uom: "KG", wastagePct: 0, totalQty: 0.1, avgRate: 330, total: 33.00 },
    ],
  },
  {
    id: "BOM-006", name: "Crew Combo Meal", components: 6, version: "v1.2",
    yield: "Set", lastUpdated: "2025-08-28", status: "Active",
    date: "2026-04-21", itemCode: "FG-27013", itemName: "Crew Combo Meal",
    department: "Hot Kitchen", section: "Crew", uom: "PCS", altUom: "",
    lotSize: 1, bomValue: 28.37, createdBy: "Md. Saidur Rahman Akash",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-27013 - Crew Combo Meal (PCS)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27080 - Rice (KG)",      type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.4, uom: "KG", wastagePct: 0, totalQty: 0.4, avgRate: 12, total: 4.80 },
      { material: "RM-27081 - Chicken (KG)",   type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.15, uom: "KG", wastagePct: 0, totalQty: 0.15, avgRate: 90, total: 13.50 },
      { material: "RM-27082 - Vegetables (KG)",type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.2, uom: "KG", wastagePct: 0, totalQty: 0.2, avgRate: 50, total: 10.07 },
    ],
  },
  {
    id: "BOM-007", name: "Mum 250 ml water", components: 1, version: "v1.0",
    yield: "1 PCS", lastUpdated: "2026-04-21", status: "Active",
    date: "2026-04-21", itemCode: "FG-27013", itemName: "Mum 250 ml water",
    department: "Beverage", section: "Water", uom: "PCS", altUom: "",
    lotSize: 1, bomValue: 28.37, createdBy: "Md. Saidur Rahman Akash",
    bomType: "Single Output",
    productionItems: [
      { item: "FG-27013 - Mum 250 ml water (PCS)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-27090 - Bottle 250ml (PCS)", type: "Packaging", excludeScrap: "No", altQty: 0, quantity: 1, uom: "PCS", wastagePct: 0, totalQty: 1, avgRate: 18, total: 18.00 },
      { material: "RM-27091 - Cap (PCS)",          type: "Packaging", excludeScrap: "No", altQty: 0, quantity: 1, uom: "PCS", wastagePct: 0, totalQty: 1, avgRate: 4,  total: 4.00 },
      { material: "RM-27092 - Label (PCS)",        type: "Packaging", excludeScrap: "No", altQty: 0, quantity: 1, uom: "PCS", wastagePct: 0, totalQty: 1, avgRate: 6.37, total: 6.37 },
    ],
  },
  {
    id: "BOM-008", name: "10w40 Lubricant", components: 1, version: "v1.0",
    yield: "1 Litre", lastUpdated: "2026-04-21", status: "Active",
    date: "2026-04-21", itemCode: "343", itemName: "Lubricant",
    department: "Maintenance", section: "Workshop", uom: "Liter", altUom: "",
    lotSize: 1, bomValue: 2311.30, createdBy: "Md. Saidur Rahman Akash",
    bomType: "Single Output",
    productionItems: [
      { item: "343 - Lubricant (Liter)", itemType: "Finished/Trading Goods", netWeight: 0, quantity: 1, costPct: 100 },
    ],
    inputMaterials: [
      { material: "RM-2701 - Base Oil (Litre)",  type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.95, uom: "Litre", wastagePct: 0, totalQty: 0.95, avgRate: 2400, total: 2280.00 },
      { material: "RM-2702 - Additives (Litre)", type: "Raw Material", excludeScrap: "No", altQty: 0, quantity: 0.05, uom: "Litre", wastagePct: 0, totalQty: 0.05, avgRate: 626, total: 31.30 },
    ],
  },
];

// Backfill defaults so existing BOMs report under Head Office Dhaka · Hot Kitchen
export const billOfMaterials: BillOfMaterial[] = _billOfMaterialsRaw.map((b) => ({
  ...b,
  officeId: b.officeId ?? "OFF-001",
  warehouseId: b.warehouseId ?? "WH-003",
}));

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

export type FlightDirection = "Outbound" | "Return";

export type FlightOrderStatus =
  | "Pending"
  | "Approved"
  | "Production"
  | "Dispatched"
  | "Completed";

/**
 * Status workflow for flight orders, in order. Use `nextFlightStatus` to
 * advance a row through the pipeline.
 */
export const FLIGHT_ORDER_STATUS_FLOW: FlightOrderStatus[] = [
  "Pending",
  "Approved",
  "Production",
  "Dispatched",
  "Completed",
];

export function nextFlightStatus(s: FlightOrderStatus): FlightOrderStatus | null {
  const i = FLIGHT_ORDER_STATUS_FLOW.indexOf(s);
  if (i < 0 || i >= FLIGHT_ORDER_STATUS_FLOW.length - 1) return null;
  return FLIGHT_ORDER_STATUS_FLOW[i + 1];
}

// ── Crew-meal slot helpers ──────────────────────────────────────────────────

export type MealSlot = "Breakfast" | "Heavy Snacks" | "Lunch" | "Dinner";

export const MEAL_SLOTS: { name: MealSlot; range: string; from: number; to: number }[] = [
  { name: "Breakfast",    range: "06:00 - 11:00", from: 6,  to: 11 },
  { name: "Heavy Snacks", range: "11:00 - 15:00", from: 11, to: 15 },
  { name: "Lunch",        range: "15:00 - 19:00", from: 15, to: 19 },
  { name: "Dinner",       range: "19:00 - 00:00", from: 19, to: 24 },
];

export function getMealSlot(etd: string): MealSlot {
  const m = etd.match(/^(\d{1,2}):/);
  const h = m ? Number(m[1]) : 0;
  if (h >= 6 && h < 11) return "Breakfast";
  if (h >= 11 && h < 15) return "Heavy Snacks";
  if (h >= 15 && h < 19) return "Lunch";
  return "Dinner";
}

const DOMESTIC_AIRPORTS = new Set(["DAC", "CGP", "CXB", "ZYL", "JSR", "RJH", "BZL"]);

export function isDomesticSector(sector: string): boolean {
  const [from, to] = sector.split(" → ").map((s) => s.trim());
  return DOMESTIC_AIRPORTS.has(from) && DOMESTIC_AIRPORTS.has(to);
}

// ── Special meals (IATA codes) ──────────────────────────────────────────────
// Master list of special meal codes used by airlines worldwide. Same data is
// surfaced on the Create form (DDL) and the Details dialog (per-type chips).

export type SpecialMealCategory = "Religious" | "Medical" | "Vegetarian" | "Other";

export const SPECIAL_MEAL_CODES: { code: string; name: string; category: SpecialMealCategory }[] = [
  { code: "AVML", name: "Asian Vegetarian Meal",      category: "Vegetarian" },
  { code: "BBML", name: "Baby Meal",                   category: "Other"      },
  { code: "BLML", name: "Bland Meal",                  category: "Medical"    },
  { code: "CHML", name: "Child Meal",                  category: "Other"      },
  { code: "DBML", name: "Diabetes Meal",               category: "Medical"    },
  { code: "FPML", name: "Fruit Platter Meal",          category: "Vegetarian" },
  { code: "GFML", name: "Gluten Free Meal",            category: "Medical"    },
  { code: "VGML", name: "Vegetarian Meal",             category: "Vegetarian" },
  { code: "LCML", name: "Low Calorie Meal",            category: "Medical"    },
  { code: "HNML", name: "Hindu Meal",                  category: "Religious"  },
  { code: "KSML", name: "Kosher Meal",                 category: "Religious"  },
  { code: "LSML", name: "Low Salt Meal",               category: "Medical"    },
  { code: "MOML", name: "Muslim Meal",                 category: "Religious"  },
  { code: "LFML", name: "Low Fat Meal",                category: "Medical"    },
  { code: "VLML", name: "Vegetarian Lacto Ovo Meal",   category: "Vegetarian" },
  { code: "VJML", name: "Vegetarian Jain Meal",        category: "Religious"  },
  { code: "NLML", name: "No Lactose Meal",             category: "Medical"    },
  { code: "SFML", name: "Seafood Meal",                category: "Other"      },
  { code: "RVML", name: "Raw Vegetarian Meal",         category: "Vegetarian" },
  { code: "VOML", name: "Vegan Meal",                  category: "Vegetarian" },
];

export const SPECIAL_MEAL_BY_CODE: Record<string, { name: string; category: SpecialMealCategory }> =
  Object.fromEntries(SPECIAL_MEAL_CODES.map((m) => [m.code, { name: m.name, category: m.category }]));

export type SpecialMealEntry = {
  id: string;
  pnr: string;
  passengerName: string;
  seat: string;
  mealCode: string; // matches SPECIAL_MEAL_CODES.code
};

// Each row is ONE flight. Multiple rows can share an `orderNo` — that's how
// a single Order # becomes a multi-leg order. `id` stays unique per row for
// stable React keys / cross-references. `direction` marks each leg as the
// outbound or the return flight of the rotation.
// `specialMealRoster` is the per-passenger manifest of special meals — when
// present it's the source of truth and `specialMeals` should equal its length.
export type FlightOrderRow = {
  id: string;
  orderNo: string;
  flight: string;
  airline: string;
  sector: string;
  date: string;
  etd: string;
  pax: number;
  crew: number;
  specialMeals: number;
  status: FlightOrderStatus;
  direction: FlightDirection;
  specialMealRoster?: SpecialMealEntry[];
};

const ROSTER_FO_001: SpecialMealEntry[] = [
  { id: "SM-001", pnr: "09QIBQ", passengerName: "NILAVRO SARKAR DIP",     seat: "21A", mealCode: "AVML" },
  { id: "SM-002", pnr: "09QIBQ", passengerName: "DIPAK SARKAR",            seat: "21B", mealCode: "AVML" },
  { id: "SM-003", pnr: "09QI6J1",passengerName: "MD SHOJIB",               seat: "22A", mealCode: "FPML" },
  { id: "SM-004", pnr: "09MC89", passengerName: "MONIR AHAMMAD",           seat: "21A", mealCode: "FPML" },
  { id: "SM-005", pnr: "09A88B", passengerName: "RAMIN HAQUE",             seat: "22A", mealCode: "BBML" },
  { id: "SM-006", pnr: "09ORUB", passengerName: "RATAN KUMAR AGARWALA",    seat: "22C", mealCode: "VJML" },
  { id: "SM-007", pnr: "09PVR6", passengerName: "DIPAK KANTI BARUA",       seat: "49A", mealCode: "VGML" },
  { id: "SM-008", pnr: "091SWT", passengerName: "RUBEL HOSEN",             seat: "19C", mealCode: "AVML" },
  { id: "SM-009", pnr: "09IA4Q", passengerName: "TAFAJJALL HOSSAIN",       seat: "49A", mealCode: "AVML" },
  { id: "SM-010", pnr: "09DH35", passengerName: "MD MIZANUR RAHMAN",       seat: "49A", mealCode: "MOML" },
  { id: "SM-011", pnr: "09QWDB", passengerName: "MD ANWAR HOSSAIN",        seat: "49B", mealCode: "BLML" },
  { id: "SM-012", pnr: "09QL8W", passengerName: "ROMANA TASNIM",           seat: "49J", mealCode: "MOML" },
];

const ROSTER_FO_003: SpecialMealEntry[] = [
  { id: "SM-101", pnr: "09KDA8", passengerName: "MOHAMMAD SAIFUL ISLAM",   seat: "21A", mealCode: "MOML" },
  { id: "SM-102", pnr: "09LPQ2", passengerName: "REBECCA AHMED",           seat: "12C", mealCode: "GFML" },
  { id: "SM-103", pnr: "09LPQ2", passengerName: "DAVID AHMED",             seat: "12D", mealCode: "GFML" },
  { id: "SM-104", pnr: "09FT3K", passengerName: "PRIYA SINGH",             seat: "8B",  mealCode: "VLML" },
  { id: "SM-105", pnr: "09FT3K", passengerName: "ROHAN SINGH",             seat: "8C",  mealCode: "VLML" },
  { id: "SM-106", pnr: "09WX1V", passengerName: "SARA KHAN",               seat: "33F", mealCode: "DBML" },
  { id: "SM-107", pnr: "09BLM9", passengerName: "JAMES O'CONNOR",          seat: "5A",  mealCode: "LFML" },
  { id: "SM-108", pnr: "09BLM9", passengerName: "EMILY O'CONNOR",          seat: "5B",  mealCode: "CHML" },
  { id: "SM-109", pnr: "09GH7T", passengerName: "FARIDA BEGUM",            seat: "27D", mealCode: "DBML" },
  { id: "SM-110", pnr: "09NM4P", passengerName: "RAJESH PATEL",            seat: "14A", mealCode: "VGML" },
  { id: "SM-111", pnr: "09NM4P", passengerName: "MEERA PATEL",             seat: "14B", mealCode: "VGML" },
  { id: "SM-112", pnr: "09NM4P", passengerName: "ARJUN PATEL",             seat: "14C", mealCode: "CHML" },
  { id: "SM-113", pnr: "09TR8Q", passengerName: "HASNA MOLLAH",            seat: "41F", mealCode: "MOML" },
  { id: "SM-114", pnr: "09XB2W", passengerName: "DEBORAH GOLDSTEIN",       seat: "3A",  mealCode: "KSML" },
  { id: "SM-115", pnr: "09XB2W", passengerName: "AARON GOLDSTEIN",         seat: "3B",  mealCode: "KSML" },
  { id: "SM-116", pnr: "09CP5N", passengerName: "ALICE NGUYEN",            seat: "29A", mealCode: "LSML" },
  { id: "SM-117", pnr: "09VK0L", passengerName: "ZAREEN HUSSAIN",          seat: "16C", mealCode: "MOML" },
  { id: "SM-118", pnr: "09ZN3H", passengerName: "ANIKA RAHMAN",            seat: "22F", mealCode: "BBML" },
];

const ROSTER_FO_007: SpecialMealEntry[] = [
  { id: "SM-201", pnr: "09DOH1", passengerName: "ABDUR RAHMAN",            seat: "15A", mealCode: "MOML" },
  { id: "SM-202", pnr: "09DOH2", passengerName: "FATIMA AKHTAR",           seat: "15B", mealCode: "MOML" },
  { id: "SM-203", pnr: "09DOH3", passengerName: "KARIM AHMED",             seat: "23C", mealCode: "MOML" },
  { id: "SM-204", pnr: "09DOH4", passengerName: "NUSRAT JAHAN",            seat: "23D", mealCode: "VGML" },
  { id: "SM-205", pnr: "09DOH5", passengerName: "IMRAN HOSSAIN",           seat: "31A", mealCode: "DBML" },
  { id: "SM-206", pnr: "09DOH6", passengerName: "LEILA AHMED",             seat: "8E",  mealCode: "BBML" },
  { id: "SM-207", pnr: "09DOH7", passengerName: "TANVIR MAHMUD",           seat: "12A", mealCode: "BLML" },
  { id: "SM-208", pnr: "09DOH8", passengerName: "SADIA RAHMAN",            seat: "12B", mealCode: "CHML" },
  { id: "SM-209", pnr: "09DOH9", passengerName: "JAHID KHAN",              seat: "19F", mealCode: "GFML" },
  { id: "SM-210", pnr: "09DOHA", passengerName: "RUMANA AKTER",            seat: "26D", mealCode: "AVML" },
];

export const seedFlightOrders: FlightOrderRow[] = [
  // ORD-3411 — completed rotation
  { id: "FO-001", orderNo: "ORD-3411", flight: "BG-401", airline: "Air Astra", sector: "DAC → DXB", date: "2026-05-20", etd: "10:30", pax: 186, crew: 14, specialMeals: 12, status: "Completed",  direction: "Outbound", specialMealRoster: ROSTER_FO_001 },
  { id: "FO-002", orderNo: "ORD-3411", flight: "BG-402", airline: "Air Astra", sector: "DXB → DAC", date: "2026-05-20", etd: "23:45", pax: 174, crew: 14, specialMeals: 8,  status: "Dispatched", direction: "Return"   },

  // ORD-3412 — currently in production
  { id: "FO-003", orderNo: "ORD-3412", flight: "BG-522", airline: "Air Astra", sector: "DAC → LHR", date: "2026-05-20", etd: "14:45", pax: 214, crew: 18, specialMeals: 18, status: "Production", direction: "Outbound", specialMealRoster: ROSTER_FO_003 },

  // ORD-3413 — full rotation, all legs in production
  { id: "FO-004", orderNo: "ORD-3413", flight: "VQ-901", airline: "US-Bangla", sector: "DAC → KUL", date: "2026-05-20", etd: "16:20", pax: 162, crew: 12, specialMeals: 8,  status: "Production", direction: "Outbound" },
  { id: "FO-005", orderNo: "ORD-3413", flight: "VQ-902", airline: "US-Bangla", sector: "KUL → SIN", date: "2026-05-20", etd: "20:40", pax: 158, crew: 12, specialMeals: 10, status: "Production", direction: "Outbound" },
  { id: "FO-006", orderNo: "ORD-3413", flight: "VQ-903", airline: "US-Bangla", sector: "SIN → DAC", date: "2026-05-20", etd: "23:55", pax: 144, crew: 12, specialMeals: 6,  status: "Approved",   direction: "Return"   },

  // ORD-3414 / ORD-3415 — pending approval / approved
  { id: "FO-007", orderNo: "ORD-3414", flight: "BS-203", airline: "US-Bangla", sector: "DAC → DOH", date: "2026-05-21", etd: "18:10", pax: 168, crew: 14, specialMeals: 10, status: "Approved",   direction: "Outbound", specialMealRoster: ROSTER_FO_007 },
  { id: "FO-008", orderNo: "ORD-3415", flight: "BS-307", airline: "US-Bangla", sector: "DAC → BKK", date: "2026-05-21", etd: "20:00", pax: 282, crew: 16, specialMeals: 22, status: "Pending",    direction: "Outbound" },

  // ── Domestic short-haul (Breakfast slot 06:00-11:00)
  { id: "FO-009", orderNo: "ORD-3416", flight: "BS-141", airline: "US-Bangla", sector: "DAC → CGP", date: "2026-05-20", etd: "06:30", pax: 68,  crew: 4,  specialMeals: 2, status: "Production", direction: "Outbound" },
  { id: "FO-010", orderNo: "ORD-3416", flight: "BS-142", airline: "US-Bangla", sector: "CGP → DAC", date: "2026-05-20", etd: "08:30", pax: 64,  crew: 4,  specialMeals: 1, status: "Production", direction: "Return"   },
  { id: "FO-011", orderNo: "ORD-3417", flight: "BS-105", airline: "US-Bangla", sector: "DAC → CXB", date: "2026-05-20", etd: "07:15", pax: 72,  crew: 4,  specialMeals: 2, status: "Approved",   direction: "Outbound" },
  { id: "FO-012", orderNo: "ORD-3418", flight: "BS-151", airline: "US-Bangla", sector: "DAC → ZYL", date: "2026-05-20", etd: "09:45", pax: 65,  crew: 4,  specialMeals: 1, status: "Pending",    direction: "Outbound" },

  // ── Domestic (Heavy Snacks 11:00-15:00)
  { id: "FO-013", orderNo: "ORD-3419", flight: "BS-195", airline: "US-Bangla", sector: "DAC → JSR", date: "2026-05-20", etd: "11:30", pax: 60,  crew: 4,  specialMeals: 2, status: "Production", direction: "Outbound" },
  { id: "FO-014", orderNo: "ORD-3420", flight: "BS-165", airline: "US-Bangla", sector: "DAC → CXB", date: "2026-05-20", etd: "13:20", pax: 72,  crew: 4,  specialMeals: 3, status: "Approved",   direction: "Outbound" },

  // ── Domestic (Lunch 15:00-19:00)
  { id: "FO-015", orderNo: "ORD-3421", flight: "BS-147", airline: "US-Bangla", sector: "DAC → CGP", date: "2026-05-20", etd: "15:40", pax: 68,  crew: 4,  specialMeals: 2, status: "Production", direction: "Outbound" },
  { id: "FO-016", orderNo: "ORD-3422", flight: "BS-149", airline: "US-Bangla", sector: "DAC → ZYL", date: "2026-05-20", etd: "17:20", pax: 64,  crew: 4,  specialMeals: 1, status: "Approved",   direction: "Outbound" },

  // ── Domestic (Dinner 19:00-24:00)
  { id: "FO-017", orderNo: "ORD-3423", flight: "BS-115", airline: "US-Bangla", sector: "DAC → CXB", date: "2026-05-20", etd: "19:30", pax: 72,  crew: 4,  specialMeals: 2, status: "Pending",    direction: "Outbound" },
  { id: "FO-018", orderNo: "ORD-3424", flight: "BS-159", airline: "US-Bangla", sector: "DAC → JSR", date: "2026-05-20", etd: "21:00", pax: 60,  crew: 4,  specialMeals: 1, status: "Pending",    direction: "Outbound" },
];

// ── Master Item Profile ──────────────────────────────────────────────────────
// Single source of truth for items used by all modules (BOM, PR, Transfer,
// Demand, Item Issue, Inventory, etc). Categories/UoMs etc are intentionally
// exported alongside the data so any UI dropdown can stay in sync.

export type ItemMaster = {
  id: string;
  code: string;
  name: string;
  itemType: "Raw Material" | "Packaging" | "Consumable" | "Finished Good" | "Semi-Finished Good";
  category: string;
  subCategory: string;
  uom: string;
  status: "Active" | "Inactive";
  currentStock?: number;
  reorderLevel?: number;
  thresholdPct?: number;
  batchNo?: string;
  expiryDate?: string;
  storage?: "Dry" | "Cold" | "Frozen";
};

export const ITEM_TYPES = [
  "Raw Material", "Packaging", "Consumable", "Finished Good", "Semi-Finished Good",
] as const;

export const ITEM_CATEGORIES = [
  "Grains", "Protein", "Vegetable", "Spices", "Oil", "Dairy", "Beverage",
  "Bakery", "Meal", "Packaging", "Other",
] as const;

export const ITEM_SUB_CATEGORIES = ["Fresh", "Frozen", "Dry", "Liquid"] as const;
export const ITEM_UOMS = ["Kg", "Gm", "Litre", "ML", "Piece", "Pack", "Bottle"] as const;
export const ITEM_STORAGE_OPTIONS = ["Dry", "Cold", "Frozen"] as const;

const RAW_ITEMS: Array<Omit<ItemMaster, "id">> = [
  // ── Raw Material · Grains
  { code: "RM-RICE-BSMT", name: "Basmati Rice",          itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-RICE-BRWN", name: "Brown Rice",            itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-RICE-PARB", name: "Parboiled Rice",        itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-FLR-WHT",   name: "Wheat Flour",           itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-FLR-APRP",  name: "All-Purpose Flour",     itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-FLR-CORN",  name: "Cornflour",             itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-FLR-RICE",  name: "Rice Flour",            itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-FLR-SMLA",  name: "Semolina",              itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-GRN-OATS",  name: "Rolled Oats",           itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-PST-SPAG",  name: "Spaghetti Pasta",       itemType: "Raw Material", category: "Grains",   subCategory: "Dry",    uom: "Kg",    status: "Active" },

  // ── Raw Material · Protein
  { code: "RM-CHK-BRST",  name: "Chicken Breast",        itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-CHK-THGH",  name: "Chicken Thigh",         itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-CHK-WHLE",  name: "Whole Chicken",         itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-BEEF-TLN",  name: "Beef Tenderloin",       itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-BEEF-MNC",  name: "Beef Mince",            itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-MUT-LEG",   name: "Mutton Leg",            itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-FSH-SLMN",  name: "Salmon Fillet",         itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-FSH-TUNA",  name: "Tuna Steak",            itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-PRWN-LRG",  name: "Prawn (Large)",         itemType: "Raw Material", category: "Protein",  subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "RM-EGG-CHK",   name: "Chicken Egg",           itemType: "Raw Material", category: "Protein",  subCategory: "Fresh",  uom: "Piece", status: "Active" },

  // ── Raw Material · Vegetable
  { code: "RM-VEG-TOM",   name: "Tomato",                itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-ONN",   name: "Onion",                 itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-POT",   name: "Potato",                itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-CAR",   name: "Carrot",                itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-CUC",   name: "Cucumber",              itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-LMN",   name: "Lemon",                 itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-LET",   name: "Lettuce",               itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-BPR",   name: "Bell Pepper",           itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-GRL",   name: "Garlic",                itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-GNG",   name: "Ginger",                itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-MSH",   name: "Mushroom",              itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-SPN",   name: "Spinach",               itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-CBG",   name: "Cabbage",               itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-VEG-CFL",   name: "Cauliflower",           itemType: "Raw Material", category: "Vegetable",subCategory: "Fresh",  uom: "Kg",    status: "Active" },

  // ── Raw Material · Spices
  { code: "RM-SPC-CMN",   name: "Cumin Powder",          itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-TRM",   name: "Turmeric Powder",       itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-CHL",   name: "Chili Powder",          itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-GMS",   name: "Garam Masala",          itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-BPP",   name: "Black Pepper",          itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-CRD",   name: "Cardamom",              itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-CIN",   name: "Cinnamon Stick",        itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-SPC-BYL",   name: "Bay Leaf",              itemType: "Raw Material", category: "Spices",   subCategory: "Dry",    uom: "Kg",    status: "Active" },

  // ── Raw Material · Oil & Fats
  { code: "RM-OIL-SOY",   name: "Soyabean Cooking Oil",  itemType: "Raw Material", category: "Oil",      subCategory: "Liquid", uom: "Litre", status: "Active" },
  { code: "RM-OIL-OLV",   name: "Olive Oil",             itemType: "Raw Material", category: "Oil",      subCategory: "Liquid", uom: "Litre", status: "Active" },
  { code: "RM-OIL-SUN",   name: "Sunflower Oil",         itemType: "Raw Material", category: "Oil",      subCategory: "Liquid", uom: "Litre", status: "Active" },
  { code: "RM-OIL-MST",   name: "Mustard Oil",           itemType: "Raw Material", category: "Oil",      subCategory: "Liquid", uom: "Litre", status: "Active" },
  { code: "RM-OIL-GHE",   name: "Ghee",                  itemType: "Raw Material", category: "Oil",      subCategory: "Dry",    uom: "Kg",    status: "Active" },

  // ── Raw Material · Dairy
  { code: "RM-DRY-BTRS",  name: "Butter (Salted)",       itemType: "Raw Material", category: "Dairy",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-DRY-BTRU",  name: "Butter (Unsalted)",     itemType: "Raw Material", category: "Dairy",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-DRY-CHED",  name: "Cheese (Cheddar)",      itemType: "Raw Material", category: "Dairy",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-DRY-MOZZ",  name: "Cheese (Mozzarella)",   itemType: "Raw Material", category: "Dairy",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-DRY-MLK",   name: "Milk (Full Cream)",     itemType: "Raw Material", category: "Dairy",    subCategory: "Liquid", uom: "Litre", status: "Active" },
  { code: "RM-DRY-YGT",   name: "Yogurt",                itemType: "Raw Material", category: "Dairy",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "RM-DRY-CRM",   name: "Heavy Cream",           itemType: "Raw Material", category: "Dairy",    subCategory: "Liquid", uom: "Litre", status: "Active" },

  // ── Raw Material · Beverage / Sundry
  { code: "RM-BV-WTR250", name: "Mineral Water 250ml",   itemType: "Raw Material", category: "Beverage", subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "RM-BV-WTR500", name: "Mineral Water 500ml",   itemType: "Raw Material", category: "Beverage", subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "RM-BV-TEA",    name: "Tea Leaves",            itemType: "Raw Material", category: "Beverage", subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-BV-COF",    name: "Coffee Beans",          itemType: "Raw Material", category: "Beverage", subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-OTH-SUG",   name: "Sugar (White)",         itemType: "Raw Material", category: "Other",    subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-OTH-SLT",   name: "Salt (Iodized)",        itemType: "Raw Material", category: "Other",    subCategory: "Dry",    uom: "Kg",    status: "Active" },
  { code: "RM-OTH-HNY",   name: "Honey",                 itemType: "Raw Material", category: "Other",    subCategory: "Liquid", uom: "Kg",    status: "Active" },
  { code: "RM-OTH-YST",   name: "Yeast (Active Dry)",    itemType: "Raw Material", category: "Bakery",   subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "RM-OTH-BKP",   name: "Baking Powder",         itemType: "Raw Material", category: "Bakery",   subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "RM-OTH-CHOC",  name: "Chocolate (Dark)",      itemType: "Raw Material", category: "Bakery",   subCategory: "Dry",    uom: "Kg",    status: "Active" },

  // ── Packaging
  { code: "PK-BOX-MEAL",  name: "Meal Box (Paper)",      itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-TRY-ALU",   name: "Aluminum Foil Tray",    itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-FIL-ALU",   name: "Aluminum Foil Roll",    itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-FIL-CLG",   name: "Cling Film",            itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-CNT-PLA",   name: "Plastic Container 250g",itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-CUP-8OZ",   name: "Disposable Cup 8oz",    itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-CUP-12OZ",  name: "Disposable Cup 12oz",   itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-STR-PLA",   name: "Plastic Straw",         itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-NPK-PPR",   name: "Paper Napkin",          itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-CTL-SET",   name: "Cutlery Set (Plastic)", itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-BTL-250",   name: "Bottle 250ml (Empty)",  itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-BTL-500",   name: "Bottle 500ml (Empty)",  itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-CAP-PET",   name: "Bottle Cap (PET)",      itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-LBL-USB",   name: "Label (US-Bangla)",     itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-LBL-MUM",   name: "Label (Mum Water)",     itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-BAG-VAC",   name: "Vacuum Seal Bag",       itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-WRP-SHR",   name: "Shrink Wrap",           itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "PK-BOX-CTN",   name: "Carton Box (Medium)",   itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "PK-TPE-SCH",   name: "Sealing Tape",          itemType: "Packaging",    category: "Packaging",subCategory: "Dry",    uom: "Piece", status: "Active" },

  // ── Semi-Finished Goods
  { code: "SF-CHK-MRN",   name: "Marinated Chicken",     itemType: "Semi-Finished Good", category: "Protein",   subCategory: "Frozen", uom: "Kg",    status: "Active" },
  { code: "SF-RCE-BLD",   name: "Boiled Rice (Plain)",   itemType: "Semi-Finished Good", category: "Grains",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "SF-VEG-CHP",   name: "Chopped Vegetable Mix", itemType: "Semi-Finished Good", category: "Vegetable", subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "SF-TOM-PUR",   name: "Tomato Puree",          itemType: "Semi-Finished Good", category: "Vegetable", subCategory: "Liquid", uom: "Kg",    status: "Active" },
  { code: "SF-PST-ONN",   name: "Onion Paste",           itemType: "Semi-Finished Good", category: "Vegetable", subCategory: "Liquid", uom: "Kg",    status: "Active" },
  { code: "SF-PST-GG",    name: "Garlic-Ginger Paste",   itemType: "Semi-Finished Good", category: "Spices",    subCategory: "Liquid", uom: "Kg",    status: "Active" },
  { code: "SF-DGH-BRD",   name: "Bread Dough",           itemType: "Semi-Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "SF-PTY-CRM",   name: "Pastry Cream",          itemType: "Semi-Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Kg",    status: "Active" },
  { code: "SF-BSE-PZA",   name: "Pizza Base",            itemType: "Semi-Finished Good", category: "Bakery",    subCategory: "Frozen", uom: "Piece",status: "Active" },
  { code: "SF-BSE-CAK",   name: "Sponge Cake Base",      itemType: "Semi-Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece",status: "Active" },
  { code: "SF-STK-CHK",   name: "Chicken Stock",         itemType: "Semi-Finished Good", category: "Protein",   subCategory: "Liquid", uom: "Litre",status: "Active" },

  // ── Finished Goods · Meals
  { code: "FG-MEAL-CBR",  name: "Chicken Biryani",       itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-BCR",  name: "Beef Curry",            itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-VPL",  name: "Veg Pulao",             itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-MCR",  name: "Mutton Curry",          itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-GSL",  name: "Grilled Salmon",        itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-FCR",  name: "Fish Curry",            itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-CBF",  name: "Continental Breakfast", itemType: "Finished Good", category: "Meal",      subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-MEAL-HMS",  name: "Hindu Meal Special",    itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-CCM",  name: "Crew Combo Meal",       itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-VML",  name: "Vegetarian Meal",       itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },
  { code: "FG-MEAL-KSH",  name: "Kosher Meal",           itemType: "Finished Good", category: "Meal",      subCategory: "Frozen", uom: "Piece", status: "Active" },

  // ── Finished Goods · Bakery & Snacks
  { code: "FG-BK-CROIS",  name: "Croissant",             itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BK-DANSH",  name: "Danish Pastry",         itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BK-MUFF",   name: "Muffin",                itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BK-DONUT",  name: "Donut",                 itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BK-CAKE",   name: "Cake Slice",            itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BK-BANC",   name: "Banana Cake",           itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BK-COOK",   name: "Cookies Pack",          itemType: "Finished Good", category: "Bakery",    subCategory: "Dry",    uom: "Pack",  status: "Active" },
  { code: "FG-SD-CHK",    name: "Sandwich (Chicken)",    itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-SD-VEG",    name: "Sandwich (Veg)",        itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BR-CHK",    name: "Chicken Burger",        itemType: "Finished Good", category: "Meal",      subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-BR-BEEF",   name: "Beef Burger",           itemType: "Finished Good", category: "Meal",      subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-SN-ENB",    name: "Energy Bar",            itemType: "Finished Good", category: "Bakery",    subCategory: "Dry",    uom: "Piece", status: "Active" },
  { code: "FG-DS-MMS",    name: "Mango Mousse",          itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },
  { code: "FG-DS-FRS",    name: "Fruit Salad Cup",       itemType: "Finished Good", category: "Bakery",    subCategory: "Fresh",  uom: "Piece", status: "Active" },

  // ── Finished Goods · Beverages
  { code: "FG-BV-MUM250", name: "Mum Water 250ml",       itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "FG-BV-MUM500", name: "Mum Water 500ml",       itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "FG-BV-ORJ",    name: "Orange Juice (1L)",     itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "FG-BV-APJ",    name: "Apple Juice (1L)",      itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "FG-BV-COLA",   name: "Soft Drink (Cola)",     itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Bottle",status: "Active" },
  { code: "FG-BV-COFB",   name: "Coffee (Black)",        itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Piece", status: "Active" },
  { code: "FG-BV-TEAM",   name: "Tea (Milk)",            itemType: "Finished Good", category: "Beverage",  subCategory: "Liquid", uom: "Piece", status: "Active" },
];

export const items: ItemMaster[] = RAW_ITEMS.map((row, i) => ({
  id: `ITM-${String(i + 1).padStart(3, "0")}`,
  ...row,
}));

/** Active master items only (use this in pickers/DDLs by default) */
export const activeItems: ItemMaster[] = items.filter((i) => i.status === "Active");

/** Filter items by item type (e.g. "Raw Material", "Finished Good") */
export const itemsByType = (...types: ItemMaster["itemType"][]): ItemMaster[] =>
  activeItems.filter((i) => types.includes(i.itemType));

// ── Org hierarchy: Company → Office → Warehouse ─────────────────────────────

export type Company = {
  id: string;
  code: string;
  name: string;
  status: "Active" | "Inactive";
};

export type Office = {
  id: string;
  code: string;
  name: string;
  companyId: string;
  address: string;
  city: string;
  manager: string;
  phone: string;
  status: "Active" | "Inactive";
};

export type WarehouseType = "Warehouse" | "Cold Store" | "Kitchen";

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  officeId: string;
  type: WarehouseType;
  address: string;
  city: string;
  manager: string;
  phone: string;
  status: "Active" | "Inactive";
};

export const companies: Company[] = [
  { id: "CMP-001", code: "USB-CAT", name: "US-Bangla Catering",   status: "Active" },
  { id: "CMP-002", code: "USB-AIR", name: "US-Bangla Airlines Ltd.", status: "Active" },
];

export const offices: Office[] = [
  { id: "OFF-001", code: "HQ-DAC",  name: "Head Office Dhaka",         companyId: "CMP-001", address: "Madina Bhaban, Turag",   city: "Dhaka",       manager: "R. Hossain", phone: "+880 1700-000001", status: "Active" },
  { id: "OFF-002", code: "REG-CGP", name: "Chittagong Regional Office", companyId: "CMP-001", address: "GEC Circle, Chattogram", city: "Chittagong",  manager: "A. Khan",    phone: "+880 1700-000010", status: "Active" },
  { id: "OFF-003", code: "REG-CXB", name: "Cox's Bazar Station Office", companyId: "CMP-001", address: "Cox's Bazar Airport",    city: "Cox's Bazar", manager: "—",         phone: "—",                status: "Inactive" },
];

export const warehouses: Warehouse[] = [
  { id: "WH-001", code: "WH-DAC-01", name: "Central Warehouse",         officeId: "OFF-001", type: "Warehouse",  address: "Hazrat Shahjalal Cargo",  city: "Dhaka",       manager: "S. Ahmed",  phone: "+880 1700-000002", status: "Active" },
  { id: "WH-002", code: "CS-DAC-01", name: "Cold Storage 1",            officeId: "OFF-001", type: "Cold Store", address: "Catering Block B Annex",  city: "Dhaka",       manager: "M. Karim",  phone: "+880 1700-000005", status: "Active" },
  { id: "WH-003", code: "KIT-HOT",   name: "Hot Kitchen",                officeId: "OFF-001", type: "Kitchen",    address: "Catering Block A",        city: "Dhaka",       manager: "F. Begum",  phone: "+880 1700-000003", status: "Active" },
  { id: "WH-004", code: "KIT-COLD",  name: "Cold Kitchen",               officeId: "OFF-001", type: "Kitchen",    address: "Catering Block B",        city: "Dhaka",       manager: "T. Islam",  phone: "+880 1700-000004", status: "Active" },
  { id: "WH-005", code: "WH-CXB-01", name: "Regional Warehouse CXB",     officeId: "OFF-003", type: "Warehouse",  address: "Cox's Bazar Airport",     city: "Cox's Bazar", manager: "—",         phone: "—",                status: "Inactive" },
];

// ── Airlines (customers we cater for) ────────────────────────────────────────
// Separate from Office — Office is OUR location, Airline is who we serve.
export type Airline = {
  id: string;
  code: string;        // short code (e.g. USB, ASTRA)
  iata: string;        // 2-char IATA flight prefix (e.g. BS, 2A)
  name: string;
  country: string;
  status: "Active" | "Inactive";
};

export const airlines: Airline[] = [
  { id: "AIR-001", code: "USB",   iata: "BS", name: "US-Bangla Airlines", country: "Bangladesh", status: "Active" },
  { id: "AIR-002", code: "ASTRA", iata: "2A", name: "Air Astra",          country: "Bangladesh", status: "Active" },
];

export const activeAirlines = airlines.filter((a) => a.status === "Active");
export const activeOffices   = offices.filter((o) => o.status === "Active");
export const activeWarehouses = warehouses.filter((w) => w.status === "Active");

export const warehousesByOffice = (officeId: string) =>
  warehouses.filter((w) => w.officeId === officeId);
export const activeWarehousesByOffice = (officeId: string) =>
  activeWarehouses.filter((w) => w.officeId === officeId);
