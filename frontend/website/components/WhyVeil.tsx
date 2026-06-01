'use client'

import { motion } from 'framer-motion'
import { Key, Globe, Layers, Check, X } from 'lucide-react'

/* ── Animation primitives (matches page.tsx) ─────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
}

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11 } },
}

const vp = { once: true, margin: '-72px' as const }

/* ── Three core differentiators ─────────────────────────────────────────── */
const BULLETS = [
    {
        Icon: Key,
        title: 'No Seed Phrases',
        body: 'Forget 24-word mnemonics. Your biometric is the only key you need — nothing to write down, nothing to lose.',
    },
    {
        Icon: Globe,
        title: 'No Extensions',
        body: 'Works in any browser, on any device, with no plugin required. One SDK call handles everything.',
    },
    {
        Icon: Layers,
        title: 'Account Abstraction',
        body: 'Soroban custom accounts unlock programmable security: multi-sig, spending limits, and guardian recovery — all on-chain.',
    },
]

/* ── Comparison table data ───────────────────────────────────────────────── */
const COMPARISON_FEATURES = [
    'No seed phrase required',
    'No browser extension needed',
    'Account abstraction (smart account)',
    'Biometric authentication',
    'On-chain signature verification',
    'Multi-device recovery',
]

const WALLETS: { name: string; supported: boolean[] }[] = [
    { name: 'Veil',      supported: [true,  true,  true,  true,  true,  true]  },
    { name: 'Freighter', supported: [false, false, false, false, false, false] },
    { name: 'xBull',     supported: [false, false, false, false, false, false] },
]

/* ── Component ───────────────────────────────────────────────────────────── */
export default function WhyVeil() {
    return (
        <section
            id="why-veil"
            className="bg-off-white section-pad"
            aria-labelledby="why-veil-heading"
        >
            <div className="max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={vp}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.p
                        variants={fadeUp}
                        className="font-anton uppercase text-near-black text-[11px] tracking-[0.3em] mb-5"
                    >
                        Why Veil
                    </motion.p>
                    <motion.h2
                        id="why-veil-heading"
                        variants={fadeUp}
                        className="font-lora font-semibold italic text-near-black text-display-sm md:text-display leading-tight"
                    >
                        Built different.{' '}
                        <span className="hl-dark">By design.</span>
                    </motion.h2>
                </motion.div>

                {/* Three bullet cards */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={vp}
                    variants={stagger}
                    className="grid md:grid-cols-3 gap-5 mb-20"
                >
                    {BULLETS.map(({ Icon, title, body }) => (
                        <motion.div
                            key={title}
                            variants={fadeUp}
                            className="card-light p-8"
                        >
                            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center mb-5" aria-hidden="true">
                                <Icon size={18} strokeWidth={1.8} className="text-near-black" />
                            </div>
                            <h3 className="font-lora font-semibold text-near-black text-xl mb-3">
                                {title}
                            </h3>
                            <p className="font-inter text-near-black/60 text-sm leading-relaxed">
                                {body}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Comparison table */}
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={vp}
                    variants={stagger}
                >
                    <motion.p
                        variants={fadeUp}
                        className="font-anton uppercase text-near-black text-[11px] tracking-[0.3em] mb-8 text-center"
                    >
                        How We Compare
                    </motion.p>

                    <motion.div variants={fadeUp} className="overflow-x-auto rounded-2xl shadow-sm border border-near-black/10">
                        <table className="w-full min-w-[520px] border-collapse bg-white" aria-label="Feature comparison: Veil vs Freighter vs xBull">
                            <thead>
                                <tr className="border-b border-near-black/10">
                                    {/* Empty header cell for the feature column */}
                                    <th
                                        scope="col"
                                        className="py-4 px-6 text-left font-inter text-xs font-semibold text-near-black/40 uppercase tracking-widest w-1/2"
                                    >
                                        Feature
                                    </th>
                                    {WALLETS.map((wallet) => (
                                        <th
                                            key={wallet.name}
                                            scope="col"
                                            className={`py-4 px-6 text-center font-lora font-semibold text-base ${
                                                wallet.name === 'Veil'
                                                    ? 'text-near-black'
                                                    : 'text-near-black/40'
                                            }`}
                                        >
                                            {wallet.name === 'Veil' ? (
                                                <span className="inline-flex items-center gap-1.5">
                                                    {wallet.name}
                                                    <span className="inline-block text-[10px] font-inter font-semibold bg-gold text-near-black px-1.5 py-0.5 rounded-full leading-none">
                                                        NEW
                                                    </span>
                                                </span>
                                            ) : (
                                                wallet.name
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_FEATURES.map((feature, rowIdx) => (
                                    <tr
                                        key={feature}
                                        className={`border-b border-near-black/[0.06] last:border-0 ${
                                            rowIdx % 2 === 0 ? 'bg-white' : 'bg-near-black/[0.02]'
                                        }`}
                                    >
                                        <th
                                            scope="row"
                                            className="py-4 px-6 text-left font-inter text-sm text-near-black/75 font-normal"
                                        >
                                            {feature}
                                        </th>
                                        {WALLETS.map((wallet) => (
                                            <td
                                                key={wallet.name}
                                                className="py-4 px-6 text-center"
                                            >
                                                {wallet.supported[rowIdx] ? (
                                                    <span aria-label="Supported">
                                                        <Check
                                                            size={18}
                                                            strokeWidth={2.5}
                                                            className="mx-auto text-teal"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                ) : (
                                                    <span aria-label="Not supported">
                                                        <X
                                                            size={18}
                                                            strokeWidth={2.5}
                                                            className="mx-auto text-near-black/25"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
