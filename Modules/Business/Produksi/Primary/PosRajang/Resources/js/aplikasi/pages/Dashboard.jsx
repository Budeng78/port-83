// Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/Dashboard.jsx

import React from 'react';
import {
    Activity,
    ArrowDownToLine,
    ArrowUpToLine,
    BarChart3,
    Boxes,
    CheckCircle2,
    Clock3,
    Factory,
    PackageCheck,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react';

const summaryCards = [
    {
        title: 'Target Hari Ini',
        value: '0',
        unit: 'Batch',
        icon: TargetIcon,
        description: 'Target produksi hari ini',
    },
    {
        title: 'Realisasi',
        value: '0',
        unit: 'Batch',
        icon: PackageCheck,
        description: 'Realisasi produksi',
    },
    {
        title: 'Sedang Proses',
        value: '0',
        unit: 'Batch',
        icon: Activity,
        description: 'Batch dalam proses',
    },
    {
        title: 'Selesai',
        value: '0',
        unit: 'Batch',
        icon: CheckCircle2,
        description: 'Batch selesai hari ini',
    },
];

const processStatus = [
    {
        label: 'Menunggu Proses',
        value: 0,
        icon: Clock3,
    },
    {
        label: 'Sedang Berjalan',
        value: 0,
        icon: Activity,
    },
    {
        label: 'Selesai',
        value: 0,
        icon: CheckCircle2,
    },
];

const activities = [
    // Data API nantinya masuk di sini.
];

function TargetIcon({ className }) {
    return <TrendingUp className={className} />;
}

function StatCard({
    title,
    value,
    unit,
    icon: Icon,
    description,
}) {
    return (
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                            {value}
                        </span>

                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {unit}
                        </span>
                    </div>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}) {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Icon className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {title}
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

export default function Dashboard() {
    return (
        <div className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                <Factory className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-2xl">
                                    Dashboard Pos Rajang
                                </h1>

                                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                    Monitoring proses produksi pada Pos Rajang
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                {/* Context */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-blue-600 dark:text-blue-400">
                                <Factory className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                    Produksi Primary · Pos Rajang
                                </p>

                                <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                                    Monitoring aktivitas dan pencapaian proses Rajang.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Sistem aktif
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <StatCard
                            key={card.title}
                            {...card}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                    {/* Production Overview */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    Overview Produksi
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Ringkasan pencapaian produksi hari ini
                                </p>
                            </div>

                            <BarChart3 className="h-5 w-5 text-slate-400" />
                        </div>

                        <EmptyState
                            icon={BarChart3}
                            title="Belum ada data produksi"
                            description="Data produksi akan ditampilkan setelah transaksi Pos Rajang mulai tersedia."
                        />
                    </div>

                    {/* Process Status */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                                Status Proses
                            </h2>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Status batch hari ini
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {processStatus.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between px-5 py-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {item.label}
                                            </span>
                                        </div>

                                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                                            {item.value}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* Recent Activity */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                                    Aktivitas Terakhir
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Aktivitas terbaru Pos Rajang
                                </p>
                            </div>

                            <Activity className="h-5 w-5 text-slate-400" />
                        </div>

                        {activities.length === 0 ? (
                            <EmptyState
                                icon={Activity}
                                title="Belum ada aktivitas"
                                description="Aktivitas transaksi Pos Rajang akan muncul di bagian ini."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="px-5 py-4"
                                    >
                                        {/* Activity item dari API */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Information */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                                Informasi Pos
                            </h2>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Informasi operasional Pos Rajang
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
                            <InfoItem
                                icon={Factory}
                                label="Area"
                                value="Produksi Primary"
                            />

                            <InfoItem
                                icon={Boxes}
                                label="Pos Kerja"
                                value="Rajang"
                            />

                            <InfoItem
                                icon={Users}
                                label="Operator"
                                value="0"
                            />

                            <InfoItem
                                icon={PackageCheck}
                                label="Output"
                                value="0 Batch"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Pos Rajang · Produksi Primary
                    </span>

                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Ready
                    </span>
                </div>
            </div>
        </div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
                    <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}