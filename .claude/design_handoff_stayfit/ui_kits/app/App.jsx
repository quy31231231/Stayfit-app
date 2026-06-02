/* StayFit UI Kit — App shell. Phone frame, theme toggle, screen routing,
   live food-log state. */
const { useState: useStateApp, useMemo: useMemoApp } = React;

const TARGET = { kcal: 2000, protein: 125, carb: 250, fat: 55 };

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = tweaks.mood === "volt" ? "dark" : "light";
  const { density, macros } = tweaks;
  const toggleTheme = () => setTweak("mood", tweaks.mood === "volt" ? "wellness" : "volt");

  const [loggedIn, setLoggedIn] = useStateApp(false);
  const [view, setView] = useStateApp("journal");
  const [log, setLog] = useStateApp(INITIAL_LOG);
  const [selectedMeal, setSelectedMeal] = useStateApp("Bữa trưa");

  const totals = useMemoApp(() => log.reduce((a, i) => ({
    kcal: a.kcal + i.kcal, protein: a.protein + i.protein, carb: a.carb + i.carb, fat: a.fat + i.fat,
  }), { kcal: 0, protein: 0, carb: 0, fat: 0 }), [log]);

  const byMeal = useMemoApp(() => {
    const m = Object.fromEntries(MEAL_ORDER.map((x) => [x, []]));
    log.forEach((i) => (m[i.meal] = m[i.meal] || []).push(i));
    return m;
  }, [log]);

  const addFromLibrary = (f) => setLog((p) => [...p, {
    id: Date.now() + Math.random(), meal: selectedMeal, name: f.name, quantity: f.per, unit: f.unit,
    kcal: f.kcal, protein: f.protein, carb: f.carb, fat: f.fat,
  }]);
  const addQuick = (meal) => { setSelectedMeal(meal); setLog((p) => [...p, {
    id: Date.now() + Math.random(), meal, name: "Món mới", quantity: 1, unit: "khẩu phần",
    kcal: 200, protein: 10, carb: 25, fat: 5 }]); };
  const remove = (id) => setLog((p) => p.filter((i) => i.id !== id));

  const compact = density === "compact";
  const screenGap = compact ? 14 : 20;

  return (
    <React.Fragment>
    <div className={"phone" + (theme === "dark" ? " dark" : "")}
      style={{ background: "var(--cream)", color: "var(--ink)" }}>
      {!loggedIn ? (
        <LoginScreen theme={theme} onToggleTheme={toggleTheme} onLogin={() => setLoggedIn(true)}/>
      ) : (
        <React.Fragment>
          <div className="scroll no-scrollbar">
            {view === "journal" && (
              <div className="screen" style={{ gap: screenGap, padding: compact ? "20px 16px 8px" : "24px 16px 8px" }}>
                <GreetingHeader name="Quy" theme={theme} onToggleTheme={toggleTheme} compact={compact}/>
                <CalorieHero totals={totals} target={TARGET} density={density} macros={macros}/>
                <AddFood selectedMeal={selectedMeal} onSelectMeal={setSelectedMeal} onAddFood={addFromLibrary}/>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 4px 10px" }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.012em" }}>Nhật ký bữa ăn</h2>
                    <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {log.length} món · {Math.round(totals.kcal)} kcal</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {MEAL_ORDER.map((m, i) => (
                      <div key={m} className="rise" style={{ animationDelay: `${i * 70}ms` }}>
                        <MealSection meal={m} items={byMeal[m] || []} onAdd={addQuick} onRemove={remove}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {view === "stats" && <div className="screen"><StatsScreen target={TARGET}/></div>}
            {view === "profile" && <div className="screen">
              <ProfileScreen name="Quy" target={TARGET} theme={theme} onToggleTheme={toggleTheme}
                onLogout={() => { setLoggedIn(false); setView("journal"); }}/>
            </div>}
          </div>
          <BottomNav view={view} setView={setView}/>
        </React.Fragment>
      )}
    </div>
    <StayFitTweaks tweaks={tweaks} setTweak={setTweak}/>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
