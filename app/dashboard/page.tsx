import { auth } from "@clerk/nextjs/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { workouts, workoutExercises, exercises, sets } from "@/src/db/schema";
import { DatePicker } from "@/components/DatePicker";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();

  const { date: dateParam } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = typeof dateParam === "string" ? dateParam : today;

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

  const rows = userId
    ? await db.query.workouts.findMany({
        where: and(
          eq(workouts.userId, userId),
          gte(workouts.startedAt, dayStart),
          lt(workouts.startedAt, dayEnd)
        ),
        with: {
          workoutExercises: {
            orderBy: (we, { asc }) => [asc(we.order)],
            with: {
              exercise: true,
              sets: {
                orderBy: (s, { asc }) => [asc(s.setNumber)],
              },
            },
          },
        },
      })
    : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Workouts</h1>
        <DatePicker value={dateStr} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No workouts logged for this day.</p>
      ) : (
        <ul className="space-y-6">
          {rows.map((workout) => (
            <li
              key={workout.id}
              className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Started:{" "}
                  {workout.startedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {workout.completedAt && (
                  <span>
                    Completed:{" "}
                    {workout.completedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {workout.workoutExercises.length === 0 ? (
                <p className="text-sm text-zinc-400">No exercises recorded.</p>
              ) : (
                <ul className="space-y-4">
                  {workout.workoutExercises.map((we) => (
                    <li key={we.id}>
                      <h3 className="mb-1 font-medium">{we.exercise.name}</h3>
                      {we.sets.length === 0 ? (
                        <p className="text-xs text-zinc-400">No sets recorded.</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-zinc-500">
                              <th className="pb-1 pr-4 font-normal">Set</th>
                              <th className="pb-1 pr-4 font-normal">Reps</th>
                              <th className="pb-1 font-normal">Weight (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {we.sets.map((s) => (
                              <tr key={s.id} className="border-t border-zinc-100 dark:border-zinc-800">
                                <td className="py-1 pr-4">{s.setNumber}</td>
                                <td className="py-1 pr-4">{s.reps ?? "—"}</td>
                                <td className="py-1">{s.weightKg ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
