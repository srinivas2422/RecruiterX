import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, BarChart3, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
export default function Home() {
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">

      {/* GLOBAL BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_40%)]" />
      <Navbar/>

      {/* HERO */}
      <section className="py-36 px-6 relative overflow-hidden">

        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/10" />
        <div className="absolute top-0 right-0 w-175 h-175 bg-primary/20 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/4" />

        <div className="max-w-5xl mx-auto text-center relative z-10">

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8">
            AI-Powered <span className="text-primary drop-shadow-sm">Interview</span> <br />
            <span className="text-primary drop-shadow-sm">Assistant</span> <br />
            for Modern Recruiters
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Let our AI voice agent conduct candidate interviews while you focus
            on finding the perfect match. Save time, reduce bias, and improve
            your hiring process.
          </p>

          <div className="flex justify-center">
            <Link href="/auth">
            <button className="px-10 py-5 rounded-full bg-primary text-primary-foreground text-base font-semibold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group">
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-6 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              Streamline Your Hiring Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RecruiterX helps you save time and find better candidates with our
              advanced AI interview technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[{
              title: "Save Time",
              desc: "Automate initial screening interviews and focus on final candidates.",
              icon: Clock,
            },
            {
              title: "Data-Driven Insights",
              desc: "Get detailed analytics and candidate comparisons based on interview responses.",
              icon: BarChart3,
            },
            {
              title: "Reduce Bias",
              desc: "Standardized interviews help eliminate unconscious bias in the hiring process.",
              icon: Shield,
            }].map((benefit, i) => (
              <div
                key={i}
                className="p-10 rounded-3xl bg-background/60 backdrop-blur-xl border border-border shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
              >

                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                  <benefit.icon size={28} />
                </div>

                <h3 className="text-xl font-semibold mb-4">
                  {benefit.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed text-sm">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              How RecruiterX Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your recruitment process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">

            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-px bg-linear-to-r from-transparent via-border to-transparent" />

            {[{
              step: "1",
              title: "Create Interview",
              desc: "Set up your job requirements and customize interview questions.",
            },
            {
              step: "2",
              title: "Share with Candidates",
              desc: "Send interview links to candidates to complete at their convenience.",
            },
            {
              step: "3",
              title: "Review Results",
              desc: "Get AI-analyzed results, transcripts, and candidate comparisons.",
            }].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center group relative z-10">

                <div className="w-20 h-20 rounded-3xl bg-background border border-border flex items-center justify-center text-2xl font-bold mb-8 shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500">
                  {item.step}
                </div>

                <h4 className="text-lg font-semibold mb-2">
                  {item.title}
                </h4>

                <p className="text-sm text-muted-foreground max-w-60">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-32 px-6 relative">

        <div className="absolute inset-0 bg-primary/10 blur-[140px] rounded-full scale-75" />

        <div className="max-w-4xl mx-auto text-center relative z-10 bg-background/70 backdrop-blur-2xl p-16 md:p-24 rounded-[2.5rem] border border-border shadow-2xl">

          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
            Ready to Transform Your Hiring Process?
          </h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            Join hundreds of companies already using RecruiterX to find the best
            talent.
          </p>
          <Link href="/auth">
          <button className="px-10 py-5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            Get Started for Free
          </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

          <Link href="/" className="text-2xl font-extrabold tracking-tight hover:opacity-80 transition">
            <Image src={'/logo.png'} alt='logo' width={200}
                        height={100}
                        className="w-37.5"
                    />
          </Link>

          <div className="flex gap-10 text-sm text-muted-foreground">
            <p>© 2026 RecruiterX</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition border-l border-border pl-6">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition">
                Terms of Service
              </a>
            </div>
          </div>

          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition text-sm">
              Twitter
            </a>
            <a href="#" className="hover:text-primary transition text-sm">
              LinkedIn
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}