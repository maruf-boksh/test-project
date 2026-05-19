import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/meal-planning")({
  head: () => ({ meta: [{ title: "Meal Planning" }] }),
  component: MealPlanning,
});

interface MealItem {
  name: string;
  weight: number;
  calories: number;
}

interface MealChoice {
  label: string;
  percentage: number;
  items: MealItem[];
}

interface SpecialMeal {
  type: string;
  portions: number | string;
  items: MealItem[];
  enabled: boolean;
}

interface MealCard {
  id: string;
  day: string;
  mealType: string;
  flightType: string[];
  forType: string;
  choices: MealChoice[];
  specialMeals: SpecialMeal[];
  dessert: MealItem;
  servingTime: { start: string; end: string };
  totalKcal: number;
  createdDate: string;
}

interface GMOrder {
  flightNumber: string;
  route: string;
  date: string;
  departureTime: string;
  paxCount: number;
  crewCount: number;
  totalMealsToday: number;
  totalMeals96h: number;
  approvedBy: string;
  approvedTimestamp: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Snacks", "Heavy Snacks", "Dinner"];

const gmOrderData: GMOrder = {
  flightNumber: "BS-315",
  route: "DAC → KUL",
  date: "2025-11-09",
  departureTime: "14:30",
  paxCount: 300,
  crewCount: 16,
  totalMealsToday: 9600,
  totalMeals96h: 38400,
  approvedBy: "S. Ahmed",
  approvedTimestamp: "2025-11-08 10:45 AM",
};

// Sample data for current day
function getSampleMeals(): MealCard[] {
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return [
    {
      id: "meal-1",
      day: today,
      mealType: "Lunch",
      flightType: ["International"],
      forType: "Passengers",
      choices: [
        {
          label: "CHOICE 1",
          percentage: 60,
          items: [
            { name: "Plain Polao", weight: 180, calories: 240 },
            { name: "Beef Rezala", weight: 100, calories: 150 },
            { name: "Mug Dal Vuna", weight: 50, calories: 80 },
          ],
        },
        {
          label: "CHOICE 2",
          percentage: 40,
          items: [
            { name: "Jeera Polao", weight: 180, calories: 245 },
            { name: "Chicken Masala", weight: 100, calories: 155 },
            { name: "Mixed Veg Curry", weight: 50, calories: 75 },
          ],
        },
      ],
      specialMeals: [
        {
          type: "VGML",
          portions: 5,
          items: [
            { name: "Plain Polao", weight: 170, calories: 230 },
            { name: "Mixed Veg Curry", weight: 70, calories: 90 },
            { name: "Mug Dal Vuna", weight: 50, calories: 80 },
          ],
          enabled: true,
        },
        {
          type: "CHML",
          portions: "As per demand",
          items: [
            { name: "Plain Polao, Saffron Rice, Chicken Korma, Kitkat Chocolate", weight: 250, calories: 450 },
          ],
          enabled: true,
        },
      ],
      dessert: { name: "Vanilla Pastry", weight: 60, calories: 180 },
      servingTime: { start: "11:00", end: "14:00" },
      totalKcal: 720,
      createdDate: new Date().toISOString().split('T')[0],
    },
    {
      id: "meal-2",
      day: today,
      mealType: "Breakfast",
      flightType: ["International", "Domestic"],
      forType: "Crew",
      choices: [
        {
          label: "CHOICE 1",
          percentage: 50,
          items: [
            { name: "Chicken Khichuri", weight: 250, calories: 280 },
            { name: "Fried Egg", weight: 50, calories: 85 },
          ],
        },
        {
          label: "CHOICE 2",
          percentage: 50,
          items: [
            { name: "Roti", weight: 80, calories: 120 },
            { name: "Scrambled Egg", weight: 100, calories: 145 },
            { name: "Mixed Veg Curry", weight: 50, calories: 75 },
          ],
        },
      ],
      specialMeals: [
        {
          type: "VGML",
          portions: 1,
          items: [
            { name: "Roti", weight: 80, calories: 120 },
            { name: "Mixed Veg", weight: 40, calories: 60 },
            { name: "Mug Dal", weight: 30, calories: 50 },
          ],
          enabled: true,
        },
      ],
      dessert: { name: "Yoghurt & Semolina", weight: 80, calories: 120 },
      servingTime: { start: "07:00", end: "10:00" },
      totalKcal: 480,
      createdDate: new Date().toISOString().split('T')[0],
    },
    {
      id: "meal-3",
      day: today,
      mealType: "Lunch",
      flightType: ["International", "Domestic"],
      forType: "Crew",
      choices: [
        {
          label: "CHOICE 1",
          percentage: 50,
          items: [
            { name: "Beef Biriyani", weight: 250, calories: 380 },
            { name: "Chicken Kabab", weight: 50, calories: 120 },
            { name: "Veg Tempura", weight: 30, calories: 90 },
          ],
        },
        {
          label: "CHOICE 2",
          percentage: 50,
          items: [
            { name: "Mughlai Chicken", weight: 100, calories: 160 },
            { name: "Veg Vajee", weight: 80, calories: 100 },
            { name: "Garlic Bread", weight: 60, calories: 180 },
          ],
        },
      ],
      specialMeals: [
        {
          type: "VGML",
          portions: 1,
          items: [
            { name: "Plain Polao", weight: 150, calories: 210 },
            { name: "Mixed Veg", weight: 100, calories: 130 },
            { name: "Potato Croquettes", weight: 40, calories: 160 },
          ],
          enabled: true,
        },
      ],
      dessert: { name: "Firni & Vanilla Pastry", weight: 100, calories: 240 },
      servingTime: { start: "11:00", end: "14:00" },
      totalKcal: 640,
      createdDate: new Date().toISOString().split('T')[0],
    },
    {
      id: "meal-4",
      day: today,
      mealType: "Dinner",
      flightType: ["International", "Domestic"],
      forType: "Crew",
      choices: [
        {
          label: "CHOICE 1",
          percentage: 50,
          items: [
            { name: "Boiled Rice", weight: 180, calories: 210 },
            { name: "Chicken Dopiaza", weight: 100, calories: 140 },
            { name: "Dal Butter Fry", weight: 50, calories: 120 },
          ],
        },
        {
          label: "CHOICE 2",
          percentage: 50,
          items: [
            { name: "Tandoori Chicken", weight: 100, calories: 160 },
            { name: "Sauteed Veg", weight: 100, calories: 110 },
            { name: "Kulcha", weight: 60, calories: 180 },
          ],
        },
      ],
      specialMeals: [
        {
          type: "VGML",
          portions: 1,
          items: [
            { name: "Boiled Rice", weight: 150, calories: 170 },
            { name: "Mixed Veg", weight: 100, calories: 130 },
            { name: "Chana Dal", weight: 40, calories: 100 },
          ],
          enabled: true,
        },
      ],
      dessert: { name: "Firni & Semolina", weight: 100, calories: 210 },
      servingTime: { start: "19:00", end: "22:00" },
      totalKcal: 590,
      createdDate: new Date().toISOString().split('T')[0],
    },
    {
      id: "meal-5",
      day: today,
      mealType: "Heavy Snacks",
      flightType: ["International", "Domestic"],
      forType: "Crew",
      choices: [
        {
          label: "CHOICE 1",
          percentage: 50,
          items: [{ name: "Roll Sandwich with Chicken & Cheese", weight: 150, calories: 320 }],
        },
        {
          label: "CHOICE 2",
          percentage: 50,
          items: [
            { name: "Korean Fried Chicken", weight: 100, calories: 280 },
            { name: "Potato Wedges", weight: 50, calories: 180 },
          ],
        },
      ],
      specialMeals: [
        {
          type: "VGML",
          portions: 1,
          items: [
            { name: "Veg Frankie", weight: 80, calories: 200 },
            { name: "Buttered Veg", weight: 30, calories: 60 },
          ],
          enabled: true,
        },
      ],
      dessert: { name: "Firni & Vanilla Pastry", weight: 80, calories: 160 },
      servingTime: { start: "16:00", end: "19:00" },
      totalKcal: 410,
      createdDate: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
    },
  ];
}

function MealPlanning() {
  const [meals, setMeals] = useState<MealCard[]>(getSampleMeals());
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [forwardConfirmOpen, setForwardConfirmOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealCard | null>(null);
  const [isForwarded, setIsForwarded] = useState(false);
  const [forwardedTime, setForwardedTime] = useState("");
  const [activeFilters, setActiveFilters] = useState({ domestic: true, international: true, passenger: true, crew: true });
  const [forwardCycle, setForwardCycle] = useState<"pending" | "forwarded" | "ready">("pending");
  const [lastForwardedQuantity, setLastForwardedQuantity] = useState(0);
  const [orderHistory, setOrderHistory] = useState<Array<{ mealsOrdered: number; orderedBy: string; designation: string; date: string; time: string; period: string }>>([
    { mealsOrdered: 9600, orderedBy: "S. Ahmed", designation: "Meal Planner", date: "08 Nov 2025", time: "10:45 AM", period: "24-hour cycle" },
  ]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalQuantity, setOrderModalQuantity] = useState("");
  const [orderModalError, setOrderModalError] = useState("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [forwardedAt, setForwardedAt] = useState<Date | null>(null);
  const [choiceEditOpen, setChoiceEditOpen] = useState(false);
  const [editingChoice, setEditingChoice] = useState<{ mealId: string; kind: "choice" | "specialMeal" | "dessert"; choiceIdx?: number; smType?: string; items: MealItem[]; label: string } | null>(null);
  const [choiceEditNotes, setChoiceEditNotes] = useState<Record<string, string[]>>({});

  const getInitialCreateData = (day: string) => ({
    day,
    flightType: [] as string[],
    forType: "",
    mealTypes: [] as string[],
    choices: [
      {
        label: "CHOICE 1",
        percentage: 60,
        items: [{ name: "", weight: 0, calories: 0 }],
      },
      {
        label: "CHOICE 2",
        percentage: 40,
        items: [{ name: "", weight: 0, calories: 0 }],
      },
    ] as MealChoice[],
    specialMeals: [
      { type: "VGML", portions: 0, items: [{ name: "", weight: 0, calories: 0 }], enabled: false },
      { type: "CHML", portions: "", items: [{ name: "", weight: 0, calories: 0 }], enabled: false },
      { type: "MOML", portions: 0, items: [{ name: "", weight: 0, calories: 0 }], enabled: false },
      { type: "HFML", portions: 0, items: [{ name: "", weight: 0, calories: 0 }], enabled: false },
      { type: "HNML", portions: 0, items: [{ name: "", weight: 0, calories: 0 }], enabled: false },
      { type: "DBML", portions: 0, items: [{ name: "", weight: 0, calories: 0 }], enabled: false },
    ] as SpecialMeal[],
    menuItems: MEAL_TYPES.reduce((acc, t) => {
      acc[t] = [{ name: "", weight: 0, calories: 0 }];
      return acc;
    }, {} as Record<string, MealItem[]>),
    dessert: { name: "", weight: 0, calories: 0 },
    servingTimes: {} as Record<string, { start: string; end: string }>,
  });

  const [createStep, setCreateStep] = useState(1);
  const [createData, setCreateData] = useState(getInitialCreateData(selectedDay));
  const [createErrors, setCreateErrors] = useState<string[]>([]);
  const [daySelectionOpen, setDaySelectionOpen] = useState(false);
  const [pendingDay, setPendingDay] = useState(selectedDay);

  const currentDayMeals = useMemo(() => meals.filter((m) => m.day === selectedDay), [meals, selectedDay]);
  const selectedMealType = createData.mealTypes[0] ?? "";
  const totalChoicePercent = createData.choices.reduce((sum, choice) => sum + choice.percentage, 0);
  const stepValid = {
    1: createData.flightType.length > 0 && createData.forType !== "",
    2: createData.mealTypes.length > 0 && createData.mealTypes.every((t) => (createData.menuItems[t] || []).some((it) => it.name.trim() !== "")),
    3: createData.choices.length > 0 && totalChoicePercent === 100,
    4: createData.mealTypes.every((t) => Boolean(createData.servingTimes[t]?.start) && Boolean(createData.servingTimes[t]?.end)),
    5: true,
  };

  const resetCreateData = (day: string) => setCreateData(getInitialCreateData(day));
  const handleCreateOpenChange = (open: boolean) => {
    setCreateModalOpen(open);
    if (open) {
      setCreateStep(1);
      resetCreateData(selectedDay);
    }
  };

  const handleCreateSave = () => {
    const errors: string[] = [];
    if (createData.flightType.length === 0) errors.push("Flight Type is required.");
    if (!createData.forType) errors.push("'For' (Passengers/Crew) is required.");
    if (createData.mealTypes.length === 0) errors.push("At least one Meal Type must be selected.");
    if (totalChoicePercent !== 100) errors.push("Choices must total 100%.");
    createData.mealTypes.forEach((t) => {
      const items = (createData.menuItems[t] || []).filter((it) => it.name.trim() !== "");
      if (items.length === 0) errors.push(`At least one menu item required for ${t}.`);
      if (!createData.servingTimes[t]?.start || !createData.servingTimes[t]?.end) errors.push(`Serving time required for ${t}.`);
    });

    if (errors.length > 0) {
      setCreateErrors(errors);
      setCreateStep(5);
      return;
    }

    const newMeals: MealCard[] = createData.mealTypes.map((mealType) => {
      const servingTime = createData.servingTimes[mealType] ?? { start: "11:00", end: "14:00" };
      const itemsForMeal = (createData.menuItems[mealType] || []).filter((it) => it.name.trim() !== "");
      const choices = createData.choices.map((choice) => ({
        ...choice,
        items: itemsForMeal,
      }));
      const specialMeals = createData.specialMeals
        .filter((s) => s.enabled)
        .map((meal) => ({ ...meal, items: meal.items.filter((it) => it.name.trim() !== "") }));

      const totalKcal = choices.reduce((sum, c) => sum + c.items.reduce((inner, it) => inner + (it.calories || 0), 0), 0) || 500;

      return {
        id: `meal-${Date.now()}-${mealType}`,
        day: createData.day,
        mealType,
        flightType: createData.flightType,
        forType: createData.forType || "Passengers",
        choices,
        specialMeals,
        dessert: createData.dessert,
        servingTime,
        totalKcal,
        createdDate: new Date().toISOString().split('T')[0],
      };
    });

    setMeals((prev) => [...prev, ...newMeals]);
    toast.success("Meal configured successfully");
    setCreateModalOpen(false);
    setCreateStep(1);
    setCreateErrors([]);
    resetCreateData(selectedDay);
  };

  const getMealsByTypeForDay = (day: string) => {
    const dayMeals = meals.filter((m) => m.day === day);
    const filtered = dayMeals.filter(mealMatchesFilters);
    const grouped: Record<string, MealCard[]> = {};
    MEAL_TYPES.forEach((type) => {
      grouped[type] = filtered.filter((m) => m.mealType === type);
    });
    return grouped;
  };

  const configuredCount = currentDayMeals.length;

  const openEditModal = (meal: MealCard) => {
    setSelectedMeal(meal);
    setCreateData({
      day: meal.day,
      flightType: meal.flightType,
      forType: meal.forType,
      mealTypes: [meal.mealType],
      choices: meal.choices,
      specialMeals: meal.specialMeals,
      dessert: meal.dessert,
      servingTimes: { [meal.mealType]: meal.servingTime },
    });
    setEditModalOpen(true);
  };

  const openViewMenu = (meal: MealCard) => {
    setSelectedMeal(meal);
    setViewMenuOpen(true);
  };

  const handleForward = () => {
    const now = new Date();
    const timestamp = now.toLocaleString();
    setForwardedTime(timestamp);
    setIsForwarded(true);
    setForwardConfirmOpen(false);
    toast.success("Meal plan forwarded to Production successfully");
  };

  const formatDateDDMMMYYYY = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getNextDate = () => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return next.toISOString().split('T')[0];
  };

  const mealMatchesFilters = (meal: MealCard) => {
    const flightTypeMatch = meal.flightType.some((ft) => (ft === "Domestic" && activeFilters.domestic) || (ft === "International" && activeFilters.international));
    const audienceMatch = (meal.forType === "Passengers" && activeFilters.passenger) || (meal.forType === "Crew" && activeFilters.crew);
    return flightTypeMatch && audienceMatch;
  };

  const hasAnyFilterActive = Object.values(activeFilters).some((v) => v);

  return (
    <>
      <PageHeader
        title="Meal Planning"
        subtitle="Configure daily meal service for passengers and crew"
        actions={
          <Dialog open={createModalOpen} onOpenChange={handleCreateOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> New Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Meal Configuration</DialogTitle>
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          createStep >= step
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step}
                      </div>
                      {step < 5 && <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {createStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Day</Label>
                      <select
                        value={createData.day}
                        onChange={(e) => setCreateData({ ...createData, day: e.target.value })}
                        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Flight Type</Label>
                      <div className="flex gap-3 mt-2">
                        {["Domestic", "International", "Both"].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="flightType"
                              value={type}
                              checked={createData.flightType.join(",") === (type === "Both" ? "Domestic,International" : type)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCreateData({
                                  ...createData,
                                  flightType: val === "Both" ? ["Domestic", "International"] : [val],
                                });
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>For</Label>
                      <div className="flex gap-3 mt-2">
                        {["Passengers", "Crew", "Both"].map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="forType"
                              value={type}
                              checked={createData.forType === type}
                              onChange={(e) => setCreateData({ ...createData, forType: e.target.value })}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {createStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>Meal Type</Label>
                      <div className="flex gap-2 mt-2">
                        {MEAL_TYPES.map((type) => {
                          const active = createData.mealTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              className={`rounded-full px-3 py-1 text-sm font-medium ${
                                active ? "bg-primary text-primary-foreground" : "bg-muted/10"
                              }`}
                              onClick={() => {
                                const exists = createData.mealTypes.includes(type);
                                const newMealTypes = exists
                                  ? createData.mealTypes.filter((t) => t !== type)
                                  : [...createData.mealTypes, type];
                                setCreateData({
                                  ...createData,
                                  mealTypes: newMealTypes,
                                  servingTimes: {
                                    ...createData.servingTimes,
                                    [type]: createData.servingTimes[type] ?? (type === "Breakfast" ? { start: "07:00", end: "10:00" } : type === "Lunch" ? { start: "11:00", end: "14:00" } : type === "Snacks" ? { start: "14:00", end: "16:00" } : type === "Heavy Snacks" ? { start: "16:00", end: "19:00" } : { start: "19:00", end: "22:00" }),
                                  },
                                });
                              }}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {createData.mealTypes.map((type) => (
                      <div key={type} className="rounded-lg border p-3">
                        <div className="font-semibold">{type}</div>
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-2 items-center text-xs font-semibold text-muted-foreground border-b pb-1">
                            <div className="w-2/5">Name</div>
                            <div className="w-1/5">Weight (g)</div>
                            <div className="w-1/5">Kcal</div>
                          </div>
                          {(createData.menuItems[type] || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Item name"
                                value={item.name}
                                onChange={(e) => {
                                  const copy = { ...createData };
                                  copy.menuItems[type][idx].name = e.target.value;
                                  setCreateData(copy);
                                }}
                                className="w-2/5 rounded border px-2 py-1"
                              />
                              <input
                                type="number"
                                placeholder="e.g. 180"
                                value={item.weight}
                                onChange={(e) => {
                                  const copy = { ...createData };
                                  copy.menuItems[type][idx].weight = Number(e.target.value);
                                  setCreateData(copy);
                                }}
                                className="w-1/5 rounded border px-2 py-1"
                              />
                              <input
                                type="number"
                                placeholder="e.g. 350"
                                value={item.calories}
                                onChange={(e) => {
                                  const copy = { ...createData };
                                  copy.menuItems[type][idx].calories = Number(e.target.value);
                                  setCreateData(copy);
                                }}
                                className="w-1/5 rounded border px-2 py-1"
                              />
                              <button
                                type="button"
                                className="text-red-600 text-sm"
                                onClick={() => {
                                  const copy = { ...createData };
                                  copy.menuItems[type] = copy.menuItems[type].filter((_, i) => i !== idx);
                                  setCreateData(copy);
                                }}
                              >
                                × Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="text-blue-600 text-sm"
                            onClick={() => {
                              const copy = { ...createData };
                              copy.menuItems[type] = [...(copy.menuItems[type] || []), { name: "", weight: 0, calories: 0 }];
                              setCreateData(copy);
                            }}
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {createStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Meal Choices</Label>
                      <span className="text-xs text-muted-foreground">Total allocation: {totalChoicePercent}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Choice 1 %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={createData.choices[0].percentage}
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            setCreateData({
                              ...createData,
                              choices: [
                                { ...createData.choices[0], percentage: value },
                                { ...createData.choices[1], percentage: Math.max(0, 100 - value) },
                              ],
                            });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Choice 2 %</Label>
                        <Input type="number" value={createData.choices[1].percentage} readOnly />
                      </div>
                    </div>
                    {totalChoicePercent !== 100 && (
                      <div className="text-sm text-destructive">Total choice percent must equal 100% before continuing.</div>
                    )}

                    <div className="space-y-3">
                      <Label>Special Meals</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {createData.specialMeals.map((meal, index) => (
                          <div key={meal.type} className="rounded-lg border p-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={meal.enabled}
                                onChange={(e) =>
                                  setCreateData({
                                    ...createData,
                                    specialMeals: createData.specialMeals.map((item, i) =>
                                      i === index ? { ...item, enabled: e.target.checked } : item,
                                    ),
                                  })
                                }
                                className="h-4 w-4"
                              />
                              <span className="font-semibold">{meal.type}</span>
                            </label>
                            {meal.enabled && (
                              <div className="mt-2 space-y-2">
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Label>Portions</Label>
                                    <Input
                                      type="number"
                                      value={meal.portions as number}
                                      onChange={(e) =>
                                        setCreateData({
                                          ...createData,
                                          specialMeals: createData.specialMeals.map((item, i) =>
                                            i === index ? { ...item, portions: Number(e.target.value) } : item,
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label>As per demand</Label>
                                    <input
                                      type="checkbox"
                                      checked={meal.portions === "As per demand" || false}
                                      onChange={(e) =>
                                        setCreateData({
                                          ...createData,
                                          specialMeals: createData.specialMeals.map((item, i) =>
                                            i === index
                                              ? { ...item, portions: e.target.checked ? "As per demand" : 0 }
                                              : item,
                                          ),
                                        })
                                      }
                                      className="h-4 w-4 mt-3"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 items-center text-xs font-semibold text-muted-foreground border-b pb-1 mt-1">
                                  <div className="w-2/5">Name</div>
                                  <div className="w-1/5">Weight (g)</div>
                                  <div className="w-1/5">Kcal</div>
                                </div>
                                {(meal.items || []).map((it, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      placeholder="Item name"
                                      value={it.name}
                                      onChange={(e) => {
                                        const copy = { ...createData };
                                        copy.specialMeals[index].items[idx].name = e.target.value;
                                        setCreateData(copy);
                                      }}
                                      className="w-2/5 rounded border px-2 py-1"
                                    />
                                    <input
                                      type="number"
                                      placeholder="e.g. 180"
                                      value={it.weight}
                                      onChange={(e) => {
                                        const copy = { ...createData };
                                        copy.specialMeals[index].items[idx].weight = Number(e.target.value);
                                        setCreateData(copy);
                                      }}
                                      className="w-1/5 rounded border px-2 py-1"
                                    />
                                    <input
                                      type="number"
                                      placeholder="e.g. 350"
                                      value={it.calories}
                                      onChange={(e) => {
                                        const copy = { ...createData };
                                        copy.specialMeals[index].items[idx].calories = Number(e.target.value);
                                        setCreateData(copy);
                                      }}
                                      className="w-1/5 rounded border px-2 py-1"
                                    />
                                    <button
                                      type="button"
                                      className="text-red-600 text-sm"
                                      onClick={() => {
                                        const copy = { ...createData };
                                        copy.specialMeals[index].items = copy.specialMeals[index].items.filter((_, i) => i !== idx);
                                        setCreateData(copy);
                                      }}
                                    >
                                      × Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="text-blue-600 text-sm"
                                  onClick={() => {
                                    const copy = { ...createData };
                                    copy.specialMeals[index].items = [...(copy.specialMeals[index].items || []), { name: "", weight: 0, calories: 0 }];
                                    setCreateData(copy);
                                  }}
                                >
                                  + Add Item
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Dessert Name</Label>
                        <Input
                          value={createData.dessert.name}
                          onChange={(e) => setCreateData({ ...createData, dessert: { ...createData.dessert, name: e.target.value } })}
                        />
                      </div>
                      <div>
                        <Label>Weight g</Label>
                        <Input
                          type="number"
                          value={createData.dessert.weight}
                          onChange={(e) => setCreateData({ ...createData, dessert: { ...createData.dessert, weight: Number(e.target.value) } })}
                        />
                      </div>
                      <div>
                        <Label>kcal</Label>
                        <Input
                          type="number"
                          value={createData.dessert.calories}
                          onChange={(e) => setCreateData({ ...createData, dessert: { ...createData.dessert, calories: Number(e.target.value) } })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {createStep === 4 && (
                  <div className="space-y-4">
                    <Label>Serving Time</Label>
                    <div className="space-y-3">
                      {createData.mealTypes.map((type) => (
                        <div key={type} className="grid grid-cols-3 gap-3 items-center">
                          <div className="font-medium">{type} serving window</div>
                          <div>
                            <Input
                              type="time"
                              value={createData.servingTimes[type]?.start ?? (type === "Breakfast" ? "07:00" : type === "Lunch" ? "11:00" : type === "Snacks" ? "14:00" : type === "Heavy Snacks" ? "16:00" : "19:00")}
                              onChange={(e) =>
                                setCreateData({
                                  ...createData,
                                  servingTimes: {
                                    ...createData.servingTimes,
                                    [type]: { ...(createData.servingTimes[type] || {}), start: e.target.value },
                                  },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Input
                              type="time"
                              value={createData.servingTimes[type]?.end ?? (type === "Breakfast" ? "10:00" : type === "Lunch" ? "14:00" : type === "Snacks" ? "16:00" : type === "Heavy Snacks" ? "19:00" : "22:00")}
                              onChange={(e) =>
                                setCreateData({
                                  ...createData,
                                  servingTimes: {
                                    ...createData.servingTimes,
                                    [type]: { ...(createData.servingTimes[type] || {}), end: e.target.value },
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {createStep === 5 && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <h4 className="font-semibold">Review & Save</h4>
                    {createErrors.length > 0 && (
                      <div className="text-sm text-destructive">
                        {createErrors.map((e, i) => (
                          <div key={i}>• {e}</div>
                        ))}
                      </div>
                    )}
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Day:</span> {createData.day}
                      </div>
                      <div>
                        <span className="font-medium">Flight Type:</span> {createData.flightType.join(", ")}
                      </div>
                      <div>
                        <span className="font-medium">For:</span> {createData.forType}
                      </div>
                      <div>
                        <span className="font-medium">Meal Types:</span> {createData.mealTypes.join(", ")}
                      </div>
                      <div>
                        <span className="font-medium">Meal Choices:</span> {createData.choices.map((c) => `${c.label} ${c.percentage}%`).join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {createStep > 1 && (
                  <Button variant="outline" onClick={() => setCreateStep(createStep - 1)}>
                    Back
                  </Button>
                )}
                {createStep < 5 && (
                  <Button onClick={() => setCreateStep(createStep + 1)} disabled={!stepValid[createStep]}>
                    Next
                  </Button>
                )}
                {createStep === 5 && (
                  <Button onClick={handleCreateSave}>
                    Save Meal Configuration
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* GM Order Banner - State A: Pending */}
      {forwardCycle === "pending" && (
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900 flex items-center justify-between">
            <span>
              📋 GM Order Received — Total meals required today: {gmOrderData.totalMealsToday.toLocaleString()} | 96-hour window meals: {gmOrderData.totalMeals96h.toLocaleString()} | Flight: {gmOrderData.flightNumber} {gmOrderData.route}
            </span>
            <Button
              size="sm"
              onClick={() => setOrderDetailsOpen(true)}
            >
              Tag & Forward to Production
            </Button>

            <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>GM Order Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Flight Number:</span> {gmOrderData.flightNumber}
                    </div>
                    <div>
                      <span className="font-semibold">Route:</span> {gmOrderData.route}
                    </div>
                    <div>
                      <span className="font-semibold">Date:</span> {gmOrderData.date}
                    </div>
                    <div>
                      <span className="font-semibold">Departure:</span> {gmOrderData.departureTime}
                    </div>
                    <div>
                      <span className="font-semibold">PAX Count:</span> {gmOrderData.paxCount}
                    </div>
                    <div>
                      <span className="font-semibold">Crew Count:</span> {gmOrderData.crewCount}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div>
                      <span className="font-semibold">Total Meals Today:</span> {gmOrderData.totalMealsToday.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Total Meals (96h):</span> {gmOrderData.totalMeals96h.toLocaleString()}
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div>
                      <span className="font-semibold">Approved By:</span> {gmOrderData.approvedBy}
                    </div>
                    <div>
                      <span className="font-semibold">Timestamp:</span> {gmOrderData.approvedTimestamp}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOrderDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setOrderDetailsOpen(false);
                      setDaySelectionOpen(true);
                      setPendingDay(selectedDay);
                    }}
                  >
                    Tag Meal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      )}

      {/* GM Order Banner - State B: Forwarded */}
      {forwardCycle === "forwarded" && (
        <Alert className="bg-green-50 border-green-200 mb-6">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900">
            <div className="flex items-center justify-between">
              <div>
                <div>Total: {lastForwardedQuantity.toLocaleString()} meal orders forwarded to Production for next 24 hours schedule</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled className="bg-green-600 hover:bg-green-600">
                  Forwarded ✓
                </Button>
                <Button size="sm" variant="outline" onClick={() => setHistoryModalOpen(true)}>
                  View History
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* GM Order Banner - State C: Ready for next order */}
      {forwardCycle === "ready" && (
        <Alert className="bg-amber-50 border-amber-200 mb-6">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-900 flex items-center justify-between">
            <div>
              <div>📋 Place meal order for next 24-hour cycle</div>
              <div className="text-amber-700 text-xs mt-1">Order meal for {formatDateDDMMMYYYY(getNextDate())}</div>
            </div>
            <Button size="sm" onClick={() => setOrderModalOpen(true)}>
              Order Meal
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Order Meal Modal - State C */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Meal Order — {formatDateDDMMMYYYY(getNextDate())}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded border">
              <div className="text-xs text-muted-foreground">
                <div>Last 24 hours — meals ordered: {lastForwardedQuantity.toLocaleString()}</div>
                {forwardedAt && (
                  <div>
                    Forwarded by: Current User | Meal Planner | {forwardedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })} {forwardedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Enter order quantity for next 24 hours:</Label>
              <Input
                type="number"
                min="1"
                value={orderModalQuantity}
                onChange={(e) => {
                  setOrderModalQuantity(e.target.value);
                  setOrderModalError("");
                }}
                className={orderModalError ? "border-red-600" : ""}
              />
              {orderModalError && <div className="text-red-600 text-xs mt-1">{orderModalError}</div>}
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any special instructions..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOrderModalOpen(false);
              setOrderModalQuantity("");
              setOrderModalError("");
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (!orderModalQuantity || Number(orderModalQuantity) <= 0) {
                setOrderModalError("Please enter quantity");
                return;
              }
              const qty = Number(orderModalQuantity);
              setLastForwardedQuantity(qty);
              setForwardCycle("forwarded");
              setForwardedAt(new Date());
              const now = new Date();
              const todayFormatted = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
              const timeFormatted = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
              setOrderHistory([...orderHistory, { mealsOrdered: qty, orderedBy: "Current User", designation: "Meal Planner", date: todayFormatted, time: timeFormatted, period: "24-hour cycle" }]);
              setOrderModalOpen(false);
              setOrderModalQuantity("");
              toast.success("Meal order forwarded to Meal Planner successfully");
            }}>
              Forward to Meal Planner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meal Order History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meal Order History</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Meals Ordered</th>
                  <th className="text-left py-2">Ordered By</th>
                  <th className="text-left py-2">Designation</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Order Period</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((entry, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{idx + 1}</td>
                    <td className="py-2">{entry.mealsOrdered.toLocaleString()}</td>
                    <td className="py-2">{entry.orderedBy}</td>
                    <td className="py-2">{entry.designation}</td>
                    <td className="py-2">{entry.date}</td>
                    <td className="py-2">{entry.time}</td>
                    <td className="py-2">{entry.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Total orders placed: {orderHistory.length} | Total meals ordered: {orderHistory.reduce((sum, e) => sum + e.mealsOrdered, 0).toLocaleString()}
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demo button - Simulate 24h */}
      {forwardCycle === "forwarded" && (
        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 underline"
            onClick={() => setForwardCycle("ready")}
          >
            [ Simulate next 24h — demo only ]
          </button>
        </div>
      )}


      {/* Day Selection Modal */}
      <Dialog open={daySelectionOpen} onOpenChange={setDaySelectionOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-white">
            <DialogTitle className="text-lg font-semibold mb-4">Tag Meal — Select Day & Configure</DialogTitle>
            <div className="flex gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    pendingDay === d
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  onClick={() => setPendingDay(d)}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable meal rows */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50">
            {(() => {
              const tagPalette = [
                { border: "border-amber-200",   header: "bg-amber-50",   headerText: "text-amber-800",   body: "bg-white",  cardAccent: "border-l-amber-400"   },
                { border: "border-sky-200",     header: "bg-sky-50",     headerText: "text-sky-800",     body: "bg-white",  cardAccent: "border-l-sky-400"     },
                { border: "border-violet-200",  header: "bg-violet-50",  headerText: "text-violet-800",  body: "bg-white",  cardAccent: "border-l-violet-400"  },
                { border: "border-orange-200",  header: "bg-orange-50",  headerText: "text-orange-800",  body: "bg-white",  cardAccent: "border-l-orange-400"  },
                { border: "border-emerald-200", header: "bg-emerald-50", headerText: "text-emerald-800", body: "bg-white",  cardAccent: "border-l-emerald-400" },
              ];
              const mealTypeTime: Record<string, string> = {
                Breakfast: "07:00 AM – 10:00 AM",
                Lunch: "11:00 AM – 02:00 PM",
                Snacks: "02:00 PM – 04:00 PM",
                "Heavy Snacks": "04:00 PM – 07:00 PM",
                Dinner: "07:00 PM – 10:00 PM",
              };
              return MEAL_TYPES.map((mealType, typeIdx) => {
                const pal = tagPalette[typeIdx % tagPalette.length];
                const mealsForType = meals.filter((m) => m.day === pendingDay && m.mealType === mealType);
                return (
                  <div key={mealType} className={`rounded-xl border ${pal.border} overflow-hidden shadow-sm`}>
                    {/* Row header */}
                    <div className={`${pal.header} px-4 py-2.5 flex items-center gap-3 border-b ${pal.border}`}>
                      <span className={`font-semibold text-sm w-28 shrink-0 ${pal.headerText}`}>{mealType}</span>
                      <span className="text-xs text-slate-400">{mealTypeTime[mealType]}</span>
                    </div>
                    {/* Row body */}
                    <div className={`${pal.body} px-4 py-3`}>
                      {mealsForType.length === 0 ? (
                        <div className="flex items-center gap-4 py-1">
                          <span className="text-sm text-slate-400 italic">No meals configured for this day</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => { setSelectedDay(pendingDay); setDaySelectionOpen(false); setCreateModalOpen(true); setCreateStep(1); }}
                          >
                            + Add New
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-3 flex-wrap items-start">
                          {mealsForType.map((meal) => (
                            <div
                              key={meal.id}
                              className={`border-l-4 ${pal.cardAccent} bg-slate-50 rounded-lg px-4 py-3 min-w-[180px] shadow-sm`}
                            >
                              <div className="font-semibold text-sm text-slate-700">{mealType} — {meal.forType}</div>
                              <div className="text-xs text-slate-500 mt-1">Serving: {meal.servingTime.start} – {meal.servingTime.end}</div>
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {meal.flightType.map((ft) => (
                                  <span key={ft} className="px-1.5 py-0.5 text-xs rounded bg-slate-200 text-slate-600">{ft}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs self-center"
                            onClick={() => { setSelectedDay(pendingDay); setDaySelectionOpen(false); setCreateModalOpen(true); setCreateStep(1); }}
                          >
                            + Add New
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-white flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDaySelectionOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                const now = new Date();
                const todayFormatted = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                const timeFormatted = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
                setForwardCycle("forwarded");
                setLastForwardedQuantity(gmOrderData.totalMealsToday);
                setForwardedAt(now);
                setOrderHistory((prev) => [...prev, { mealsOrdered: gmOrderData.totalMealsToday, orderedBy: "Current User", designation: "Meal Planner", date: todayFormatted, time: timeFormatted, period: "24-hour cycle" }]);
                setDaySelectionOpen(false);
                toast.success("Meal plan tagged and forwarded to Production");
              }}
            >
              Forward to Production
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Tabs */}
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="mb-6">
        <TabsList>
          {DAYS.map((day) => (
            <TabsTrigger key={day} value={day}>
              {day}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Filter Bar */}
        <div className="flex gap-2 mt-4 mb-4">
          {[
            { key: "domestic", label: "Domestic" },
            { key: "international", label: "International" },
            { key: "passenger", label: "Passenger" },
            { key: "crew", label: "Crew" },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeFilters[filter.key as keyof typeof activeFilters]
                  ? "bg-primary text-primary-foreground"
                  : "bg-white border border-gray-300 text-gray-600"
              }`}
              onClick={() =>
                setActiveFilters({
                  ...activeFilters,
                  [filter.key]: !activeFilters[filter.key as keyof typeof activeFilters],
                })
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        {!hasAnyFilterActive && (
          <div className="text-center py-12 text-muted-foreground">
            No filters selected — select at least one filter to view meals
          </div>
        )}

        {hasAnyFilterActive && DAYS.map((day) => {
          const mealsByType = getMealsByTypeForDay(day);
          const rowPalette = [
            { border: "border-amber-200",  header: "bg-amber-100",  headerText: "text-amber-800",  body: "bg-amber-50/60",  cardBorder: "border-l-amber-400"  },
            { border: "border-sky-200",    header: "bg-sky-100",    headerText: "text-sky-800",    body: "bg-sky-50/60",    cardBorder: "border-l-sky-400"    },
            { border: "border-violet-200", header: "bg-violet-100", headerText: "text-violet-800", body: "bg-violet-50/60", cardBorder: "border-l-violet-400" },
            { border: "border-orange-200", header: "bg-orange-100", headerText: "text-orange-800", body: "bg-orange-50/60", cardBorder: "border-l-orange-400" },
            { border: "border-emerald-200",header: "bg-emerald-100",headerText: "text-emerald-800",body: "bg-emerald-50/60",cardBorder: "border-l-emerald-400"},
          ];
          const mealTypeTime: Record<string, string> = {
            Breakfast: "07:00 AM – 10:00 AM",
            Lunch: "11:00 AM – 02:00 PM",
            Snacks: "02:00 PM – 04:00 PM",
            "Heavy Snacks": "04:00 PM – 07:00 PM",
            Dinner: "07:00 PM – 10:00 PM",
          };
          return (
          <TabsContent key={day} value={day} className="mt-4">
            <div className="space-y-3">
              {MEAL_TYPES.map((mealType, typeIdx) => {
                const palette = rowPalette[typeIdx % rowPalette.length];
                const mealsForType = mealsByType[mealType];
                return (
                  <div key={mealType} className={`rounded-lg border ${palette.border} overflow-hidden`}>
                    <div className={`${palette.header} px-4 py-2.5 flex items-center gap-4`}>
                      <span className={`font-semibold text-sm w-28 shrink-0 ${palette.headerText}`}>{mealType}</span>
                      <span className="text-xs text-muted-foreground">{mealTypeTime[mealType]}</span>
                    </div>
                    <div className={`${palette.body} p-3`}>
                      {mealsForType.length === 0 ? (
                        <div className="py-4 text-center text-muted-foreground text-sm">
                          No meals configured — click + New Meal to add
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {mealsForType.map((meal) => {
                            const choiceCardColors = [
                              { header: "bg-blue-100 text-blue-800", border: "border-blue-200" },
                              { header: "bg-teal-100 text-teal-800", border: "border-teal-200" },
                              { header: "bg-indigo-100 text-indigo-800", border: "border-indigo-200" },
                            ];
                            return (
                              <div key={meal.id}>
                                {/* Meal meta-header */}
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <span className="text-sm font-semibold">{meal.forType}</span>
                                  {meal.flightType.map((ft) => (
                                    <span key={ft} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">{ft}</span>
                                  ))}
                                  <span className="text-xs text-muted-foreground">Serving: {meal.servingTime.start} – {meal.servingTime.end}</span>
                                  <span className="text-xs italic text-muted-foreground">Effective: {formatDateDDMMMYYYY(meal.createdDate)}</span>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs ml-auto" onClick={() => openViewMenu(meal)}>📋 View Menu</Button>
                                </div>

                                {/* Choice cards + special meal cards + dessert — horizontal */}
                                <div className="flex gap-3 flex-wrap">
                                  {meal.choices.map((choice, choiceIdx) => {
                                    const cc = choiceCardColors[choiceIdx % choiceCardColors.length];
                                    const choiceTotal = choice.items.reduce((s, it) => s + (it.calories || 0), 0);
                                    const noteKey = `${meal.id}-${choiceIdx}`;
                                    return (
                                      <Card key={choiceIdx} className={`border ${cc.border} w-56 shrink-0 bg-card`}>
                                        <div className={`px-3 py-2 rounded-t-lg font-semibold text-xs ${cc.header}`}>
                                          CHOICE {String(choiceIdx + 1).padStart(2, "0")} — {choice.percentage}%
                                        </div>
                                        <CardContent className="p-3 space-y-2">
                                          <ol className="text-xs space-y-1 list-decimal list-inside">
                                            {choice.items.map((item, itemIdx) => (
                                              <li key={itemIdx} className="leading-relaxed">
                                                <span className="font-medium">{item.name}</span>
                                                {item.weight > 0 && <span className="text-muted-foreground"> – {item.weight}g</span>}
                                              </li>
                                            ))}
                                          </ol>
                                          <div className="text-xs font-semibold border-t pt-1.5">Total: {choiceTotal} kcal</div>
                                          <Button
                                            size="sm"
                                            className="w-full h-7 text-xs bg-slate-700 hover:bg-slate-600 text-white"
                                            onClick={() => {
                                              setEditingChoice({ mealId: meal.id, kind: "choice", choiceIdx, items: choice.items.map((i) => ({ ...i })), label: `Choice ${String(choiceIdx + 1).padStart(2, "0")} — ${choice.percentage}%` });
                                              setChoiceEditOpen(true);
                                            }}
                                          >
                                            ✏ Edit
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}

                                  {/* Special meal cards */}
                                  {meal.specialMeals.filter((sm) => sm.enabled).map((sm) => {
                                    const smTotal = sm.items.reduce((s, it) => s + (it.calories || 0), 0);
                                    return (
                                      <Card key={sm.type} className="border border-purple-200 w-56 shrink-0 bg-card">
                                        <div className="px-3 py-2 rounded-t-lg font-semibold text-xs bg-purple-100 text-purple-800">
                                          {sm.type} {typeof sm.portions === "number" ? `(${sm.portions} portion${sm.portions !== 1 ? "s" : ""})` : `(${sm.portions})`}
                                        </div>
                                        <CardContent className="p-3 space-y-2">
                                          <ol className="text-xs space-y-1 list-decimal list-inside">
                                            {sm.items.map((item, idx) => (
                                              <li key={idx} className="leading-relaxed">
                                                <span className="font-medium">{item.name}</span>
                                                {item.weight > 0 && <span className="text-muted-foreground"> – {item.weight}g</span>}
                                              </li>
                                            ))}
                                          </ol>
                                          <div className="text-xs font-semibold border-t pt-1.5">Total: {smTotal} kcal</div>
                                          <Button
                                            size="sm"
                                            className="w-full h-7 text-xs bg-slate-700 hover:bg-slate-600 text-white"
                                            onClick={() => {
                                              setEditingChoice({ mealId: meal.id, kind: "specialMeal", smType: sm.type, items: sm.items.map((i) => ({ ...i })), label: `${sm.type} ${typeof sm.portions === "number" ? `(${sm.portions} portions)` : `(${sm.portions})`}` });
                                              setChoiceEditOpen(true);
                                            }}
                                          >
                                            ✏ Edit
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}

                                  {/* Dessert card */}
                                  {meal.dessert.name && (
                                    <Card className="border border-pink-200 w-56 shrink-0 bg-card">
                                      <div className="px-3 py-2 rounded-t-lg font-semibold text-xs bg-pink-100 text-pink-800">Dessert</div>
                                      <CardContent className="p-3 space-y-2">
                                        <div className="text-xs font-medium">{meal.dessert.name}{meal.dessert.weight > 0 && ` – ${meal.dessert.weight}g`}</div>
                                        <div className="text-xs font-semibold border-t pt-1.5">Total: {meal.dessert.calories} kcal</div>
                                        <Button
                                          size="sm"
                                          className="w-full h-7 text-xs bg-slate-700 hover:bg-slate-600 text-white"
                                          onClick={() => {
                                            setEditingChoice({ mealId: meal.id, kind: "dessert", items: [{ ...meal.dessert }], label: "Dessert" });
                                            setChoiceEditOpen(true);
                                          }}
                                        >
                                          ✏ Edit
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        );
        })}
      </Tabs>

      {/* View Menu Modal */}
      <Dialog open={viewMenuOpen} onOpenChange={setViewMenuOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Meal Menu</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                🖨 Print
              </Button>
            </div>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <h4 className="font-semibold">{selectedMeal.mealType}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedMeal.forType} • {selectedMeal.flightType.join(", ")}
                </p>
              </div>

              {selectedMeal.choices.map((choice, idx) => (
                <div key={idx} className="border-b pb-3">
                  <h5 className="font-semibold text-sm mb-2">
                    {choice.label} ({choice.percentage}%)
                  </h5>
                  <ul className="ml-4 space-y-1 text-sm">
                    {choice.items.map((item) => (
                      <li key={item.name}>
                        {item.name} — {item.weight}g
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {selectedMeal.specialMeals
                .filter((sm) => sm.enabled)
                .map((sm) => (
                  <div key={sm.type} className="border-b pb-3">
                    <h5 className="font-semibold text-sm mb-2">
                      {sm.type}
                      {typeof sm.portions === "number"
                        ? ` (${sm.portions} portion${sm.portions > 1 ? "s" : ""})`
                        : ` (${sm.portions})`}
                    </h5>
                    <ul className="ml-4 space-y-1 text-sm">
                      {sm.items.map((item) => (
                        <li key={item.name}>
                          {item.name} — {item.weight}g
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

              <div className="border-b pb-3">
                <h5 className="font-semibold text-sm mb-2">Dessert</h5>
                <p className="ml-4 text-sm">
                  {selectedMeal.dessert.name} — {selectedMeal.dessert.weight}g
                </p>
              </div>

              <div className="flex justify-between items-end pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Serving: {selectedMeal.servingTime.start} – {selectedMeal.servingTime.end}
                </p>
                <p className="font-semibold text-lg">Total: {selectedMeal.totalKcal} kcal</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewMenuOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Edit Modal — shared for Choice, Special Meal, and Dessert cards */}
      <Dialog open={choiceEditOpen} onOpenChange={setChoiceEditOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingChoice?.label ?? ""}</DialogTitle>
          </DialogHeader>
          {editingChoice && (() => {
            const noteKey = editingChoice.kind === "choice"
              ? `${editingChoice.mealId}-choice-${editingChoice.choiceIdx}`
              : editingChoice.kind === "specialMeal"
              ? `${editingChoice.mealId}-sm-${editingChoice.smType}`
              : `${editingChoice.mealId}-dessert`;
            const existingNotes = choiceEditNotes[noteKey] ?? [];
            return (
              <div className="space-y-3">
                <div className="flex gap-2 items-center text-xs font-semibold text-muted-foreground border-b pb-1">
                  <div className="flex-1">Name</div>
                  <div className="w-20">Weight (g)</div>
                  <div className="w-16">Kcal</div>
                  <div className="w-16" />
                </div>

                {editingChoice.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const updated = editingChoice.items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it);
                        setEditingChoice({ ...editingChoice, items: updated });
                      }}
                      className="flex-1 rounded border px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="g"
                      value={item.weight}
                      onChange={(e) => {
                        const updated = editingChoice.items.map((it, i) => i === idx ? { ...it, weight: Number(e.target.value) } : it);
                        setEditingChoice({ ...editingChoice, items: updated });
                      }}
                      className="w-20 rounded border px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="kcal"
                      value={item.calories}
                      onChange={(e) => {
                        const updated = editingChoice.items.map((it, i) => i === idx ? { ...it, calories: Number(e.target.value) } : it);
                        setEditingChoice({ ...editingChoice, items: updated });
                      }}
                      className="w-16 rounded border px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      className="text-red-600 text-sm shrink-0 w-16 text-right"
                      onClick={() => setEditingChoice({ ...editingChoice, items: editingChoice.items.filter((_, i) => i !== idx) })}
                    >
                      × Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="text-blue-600 text-sm"
                  onClick={() => setEditingChoice({ ...editingChoice, items: [...editingChoice.items, { name: "", weight: 0, calories: 0 }] })}
                >
                  + Add Item
                </button>

                {/* Change notes — shown only inside edit modal */}
                {existingNotes.length > 0 && (
                  <div className="border-t pt-3 space-y-1">
                    {existingNotes.map((note, i) => (
                      <div key={i} className="text-xs text-muted-foreground italic bg-muted/40 px-2 py-1 rounded">{note}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setChoiceEditOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!editingChoice) return;
                const { mealId, kind, choiceIdx, smType, items } = editingChoice;
                const noteKey = kind === "choice"
                  ? `${mealId}-choice-${choiceIdx}`
                  : kind === "specialMeal"
                  ? `${mealId}-sm-${smType}`
                  : `${mealId}-dessert`;

                const oldMeal = meals.find((m) => m.id === mealId);
                let oldItems: MealItem[] = [];
                if (kind === "choice" && choiceIdx !== undefined) oldItems = oldMeal?.choices[choiceIdx]?.items ?? [];
                else if (kind === "specialMeal") oldItems = oldMeal?.specialMeals.find((sm) => sm.type === smType)?.items ?? [];
                else if (kind === "dessert" && oldMeal) oldItems = [oldMeal.dessert];

                const oldNames = new Set(oldItems.map((it) => it.name.trim()).filter(Boolean));
                const newlyAdded = items.filter((it) => it.name.trim() && !oldNames.has(it.name.trim()));

                setMeals((prev) =>
                  prev.map((m) => {
                    if (m.id !== mealId) return m;
                    if (kind === "choice" && choiceIdx !== undefined)
                      return { ...m, choices: m.choices.map((c, ci) => ci === choiceIdx ? { ...c, items } : c) };
                    if (kind === "specialMeal")
                      return { ...m, specialMeals: m.specialMeals.map((sm) => sm.type === smType ? { ...sm, items } : sm) };
                    if (kind === "dessert" && items.length > 0)
                      return { ...m, dessert: items[0] };
                    return m;
                  })
                );

                if (newlyAdded.length > 0) {
                  const now = new Date();
                  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
                  const newNotes = newlyAdded.map((it) => `"${it.name}" has been added by Current User on ${dateStr}, ${timeStr}`);
                  setChoiceEditNotes((prev) => ({ ...prev, [noteKey]: [...(prev[noteKey] ?? []), ...newNotes] }));
                }

                setChoiceEditOpen(false);
                toast.success("Updated successfully");
              }}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forward Modal */}
      <Dialog open={forwardConfirmOpen} onOpenChange={setForwardConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward Meal Plan to Production?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Day:</span> {selectedDay}
            </div>
            <div>
              <span className="font-semibold">Meal Types Configured:</span> {configuredCount}
            </div>
            <div>
              <span className="font-semibold">Total Estimated kcal:</span>{" "}
              {currentDayMeals.reduce((sum, m) => sum + m.totalKcal, 0)}
            </div>
            <div className="border-t pt-3">
              <span className="font-semibold">Forwarded by:</span> Current User — {new Date().toLocaleString()}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setForwardConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleForward}>Confirm & Forward</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
