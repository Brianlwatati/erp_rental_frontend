import { Unit } from "@/types/property";
import { StatusBadge } from "@/components/ui/badge";

function getGridColumn(unit: Unit) {
  return typeof unit.grid_column === "number" &&
    Number.isInteger(unit.grid_column) &&
    unit.grid_column >= 0
    ? unit.grid_column
    : undefined;
}

export function BuildingUnitsGrid({
  floorCount,
  units,
}: {
  floorCount: number;
  units: Unit[];
}) {
  const safeFloorCount = Number.isFinite(floorCount)
    ? Math.max(0, Math.floor(floorCount))
    : 0;
  const floors = Array.from(
    { length: safeFloorCount },
    (_, index) => index + 1,
  );

  const rows = floors.map((floor) => {
    const floorUnits = units
      .filter((unit) => unit.floor === floor)
      .sort((left, right) => {
        const leftColumn = getGridColumn(left) ?? Number.MAX_SAFE_INTEGER;
        const rightColumn = getGridColumn(right) ?? Number.MAX_SAFE_INTEGER;
        return leftColumn - rightColumn;
      });
    const cells: (Unit | null)[] = [];

    for (const unit of floorUnits) {
      let column = getGridColumn(unit);
      if (
        column === undefined ||
        (cells[column] !== null && column < cells.length)
      ) {
        column = cells.findIndex((cell) => cell === null);
      }
      if (column === undefined || column < 0) column = cells.length;

      while (cells.length <= column) cells.push(null);
      cells[column] = unit;
    }

    return { floor, cells };
  });

  const columnCount = Math.max(1, ...rows.map((row) => row.cells.length));
  const gridColumns = `7rem repeat(${columnCount}, minmax(10rem, 1fr))`;

  return (
    <section className="space-y-4" aria-labelledby="unit-layout-title">
      <div>
        <h2 id="unit-layout-title" className="text-lg font-bold text-slate-900">
          Unit Layout
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Units are positioned by floor and grid column.
        </p>
      </div>

      {floors.length === 0 ? (
        <p className="border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          No floors are configured for this building.
        </p>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-max space-y-3">
            <div
              className="grid gap-3 px-1 text-xs font-semibold text-slate-500"
              style={{ gridTemplateColumns: gridColumns }}
            >
              <span>Floor</span>
              {Array.from({ length: columnCount }, (_, column) => (
                <span key={column}>Grid {column}</span>
              ))}
            </div>

            {rows.map(({ floor, cells }) => (
              <div
                key={floor}
                className="grid items-stretch gap-3"
                style={{ gridTemplateColumns: gridColumns }}
                aria-label={`Floor ${floor}`}
              >
                <div className="flex items-center rounded border border-slate-200 bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-700">
                  Floor {floor}
                </div>
                {Array.from({ length: columnCount }, (_, column) => {
                  const unit = cells[column] ?? null;

                  return unit ? (
                    <article
                      key={column}
                      className="space-y-3 border border-slate-200 bg-white p-3"
                      aria-label={`${unit.unit_number}, floor ${floor}, grid ${column}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="wrap-break-word text-sm font-bold text-slate-900">
                          {unit.unit_number}
                        </h3>
                        <StatusBadge status={unit.status} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Intl.NumberFormat("en-KE", {
                          style: "currency",
                          currency: "KES",
                          maximumFractionDigits: 0,
                        }).format(Number(unit.monthly_rent) || 0)}{" "}
                        <span className="text-slate-400">/ month</span>
                      </p>
                    </article>
                  ) : (
                    <div
                      key={column}
                      className="flex min-h-24 items-center justify-center border border-dashed border-slate-300 bg-slate-50/60 text-xs text-slate-400"
                      aria-label={`Empty, floor ${floor}, grid ${column}`}
                    >
                      Empty
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
