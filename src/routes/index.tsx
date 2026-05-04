import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Trophy, Users, Zap, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{ rotate: 5, scale: 1.1 }}
              className="size-10 rounded-2xl bg-gradient-neon flex items-center justify-center glow-neon"
            >
              <Zap className="size-6 text-white fill-white" />
            </motion.div>
            <div>
              <div className="font-display font-bold text-lg leading-none tracking-tight">Nexus</div>
              <div className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">Exchange</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-full border border-primary/25 bg-secondary/80 text-sm font-bold text-foreground hover:bg-secondary transition-all"
            >
              Join / Register
            </Link>
            <Link
              to="/feed"
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
            >
              Enter App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-32 max-w-6xl mx-auto">
        <div className="absolute top-20 -left-20 size-80 rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute top-40 -right-20 size-80 rounded-full bg-violet/10 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative text-center max-w-3xl mx-auto"
        >
          <motion.span 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[10px] font-black uppercase tracking-widest text-primary mb-8 border border-primary/10"
          >
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Built for Trusted Networks
          </motion.span>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-display font-black leading-[0.95] tracking-tighter mb-8"
          >
            Stop losing deals in <br/>
            <span className="text-primary italic">WhatsApp groups.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Nexus is the structured exchange where every opportunity gets validated, claimed, executed, and scored. 
            No noise, just high-intent deals.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass font-black border border-primary/20 hover:bg-secondary transition-all"
            >
              Join / Register
            </Link>
            <Link to="/feed" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
              Browse Opportunities
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/submit" className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass font-bold border border-primary/5 hover:bg-secondary transition-all">
              Submit One
            </Link>
          </motion.div>

          {/* Floating mock card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, rotate: -1 }}
            className="mt-24 glass rounded-3xl p-8 max-w-md mx-auto text-left shadow-2xl shadow-primary/10 border border-primary/5 relative"
          >
            <div className="absolute -top-4 -right-4 size-16 rounded-full bg-gradient-neon flex items-center justify-center text-white font-black shadow-xl rotate-12">
              NEW
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Validated
              </span>
              <span className="text-2xl font-black text-primary">$120,000</span>
            </div>
            <h3 className="text-xl font-bold mb-2 leading-tight">Enterprise SaaS Deal — Fintech CTO Intro</h3>
            <p className="text-sm text-muted-foreground font-medium">Warm intro available for the right partner. Decision expected within 30 days.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Lifecycle */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight">The Opportunity Lifecycle</h2>
          <p className="text-muted-foreground font-medium">Six structured stages. Zero ambiguity.</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {["Submit", "Validate", "Claim", "Execute", "Close", "Score"].map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 text-center border border-primary/5 hover:border-primary/20 transition-all shadow-lg hover:shadow-primary/10"
            >
              <div className="size-12 mx-auto mb-4 rounded-2xl bg-gradient-neon flex items-center justify-center text-white font-black text-xl shadow-lg">
                {i + 1}
              </div>
              <div className="text-sm font-black uppercase tracking-widest text-foreground">{s}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Curated & Validated", desc: "Every opportunity is high-intent. No spam, no noise. Just quality deals." },
            { icon: Users, title: "Multi-Claim Flow", desc: "Multiple members can claim. Submitter picks the best partner for the job." },
            { icon: Trophy, title: "Compounding Reputation", desc: "Close deals, earn points, and climb tiers to unlock exclusive network perks." },
            { icon: Zap, title: "Real-time Tracking", desc: "From 'Pending' to 'Closed', track every step of the deal lifecycle live." },
            { icon: TrendingUp, title: "Performance Insights", desc: "Detailed leaderboards for Top Closers, Contributors, and Most Trusted." },
            { icon: CheckCircle2, title: "Bulletproof Disputes", desc: "Structured flows for rejections and escalations. Every edge case is covered." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass rounded-3xl p-8 border border-primary/5 hover:border-primary/20 transition-all shadow-xl hover:shadow-primary/10"
            >
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-inner">
                <f.icon className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32 max-w-5xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-[3rem] p-16 relative overflow-hidden shadow-2xl shadow-primary/20 border border-primary/10"
        >
          <div className="absolute inset-0 bg-gradient-aurora opacity-30" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6 tracking-tight">Your next deal is <br/>waiting in Nexus.</h2>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto">Join the structured exchange for professional introductions.</p>
            <Link to="/feed" className="group inline-flex items-center gap-3 px-12 py-5 rounded-full bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
              Enter the Hub <ArrowRight className="size-6" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="px-6 py-12 text-center">
        <div className="font-display font-black text-2xl tracking-tighter mb-2">Nexus</div>
        <div className="text-[10px] text-muted-foreground font-bold tracking-[0.3em] uppercase mb-8">Exchange Hub</div>
        <div className="text-xs text-muted-foreground font-medium">
          © 2026 Nexus Exchange Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
