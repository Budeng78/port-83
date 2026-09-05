<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TimbanganPos1Updated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $timbangan,
        public float $berat,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('timbangan.pos1'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'TimbanganPos1Updated';
    }
}