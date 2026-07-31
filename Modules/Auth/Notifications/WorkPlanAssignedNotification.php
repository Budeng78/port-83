<?php

namespace Modules\Auth\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WorkPlanAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $workPlan;

    // Terima data rencana kerja saat notifikasi dipanggil
    public function __construct($workPlan)
    {
        $this->workPlan = $workPlan;
    }

    // Tentukan channel pengiriman (sementara kita gunakan 'database')
    public function via($notifiable)
    {
        return ['database'];
    }

    // Format data JSON yang akan disimpan ke tabel notifications
    public function toArray($notifiable)
    {
        return [
            'title' => 'Jadwal Rencana Kerja Baru',
            'message' => 'Anda mendapat jadwal job baru: ' . ($this->workPlan->title ?? 'Tugas Operasional'),
            'work_plan_id' => $this->workPlan->id ?? null,
            'assigned_by' => $this->workPlan->creator_name ?? 'Atasan',
            'created_at' => now(),
        ];
    }
}