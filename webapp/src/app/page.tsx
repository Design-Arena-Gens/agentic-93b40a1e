import RickshawScene from "@/components/rickshaw-scene";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-16 px-6 py-16 md:px-10 lg:px-12">
        <section className="flex w-full flex-col items-center gap-6 text-center md:text-left">
          <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
            Foggy Dhaka Morning
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            Winter dawn in Old Dhaka, captured through a hand-drawn moving palette.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
            Watch a Bangladeshi rickshaw puller steer through mist-laden streets, wrapped in his weathered lungi and jacket, as the city slowly wakes under a warm sunrise glow.
          </p>
        </section>
        <RickshawScene />
        <p className="max-w-2xl text-center text-sm text-white/50 md:text-base">
          This looping illustration gently animates layered fog, painted light, and a traditional rickshaw to evoke the still, poetic calm of Dhaka&apos;s winter mornings.
        </p>
      </main>
    </div>
  );
}
