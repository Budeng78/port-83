<section class="py-16 bg-slate-50">

    <div class="max-w-7xl mx-auto px-6">

        <div class="mb-8">

            <h2 class="text-3xl font-bold text-slate-800">
                Monitoring Timbangan
            </h2>

            <p class="mt-2 text-slate-500">
                Data realtime dari MQTT
            </p>

        </div>


        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            {{-- STATUS --}}
            <div class="bg-white rounded-2xl p-6 shadow-sm border">

                <div class="text-sm text-slate-500">
                    MQTT Status
                </div>

                <div
                    id="mqtt-status"
                    class="mt-3 text-xl font-bold text-amber-500"
                >
                    CONNECTING...
                </div>

            </div>


            {{-- BERAT --}}
            <div class="bg-white rounded-2xl p-6 shadow-sm border">

                <div class="text-sm text-slate-500">
                    Berat
                </div>

                <div class="mt-3">

                    <span
                        id="timbangan-value"
                        class="text-5xl font-bold text-slate-800"
                    >
                        --
                    </span>

                    <span class="text-xl text-slate-500">
                        kg
                    </span>

                </div>

            </div>


            {{-- DEVICE --}}
            <div class="bg-white rounded-2xl p-6 shadow-sm border">

                <div class="text-sm text-slate-500">
                    Device
                </div>

                <div
                    id="timbangan-device"
                    class="mt-3 text-lg font-semibold text-slate-800"
                >
                    --
                </div>

            </div>

        </div>


        {{-- DETAIL --}}
        <div class="mt-6 bg-white rounded-2xl p-6 shadow-sm border">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>

                    <div class="text-sm text-slate-500">
                        Topic
                    </div>

                    <div
                        id="timbangan-topic"
                        class="mt-1 font-mono text-slate-700"
                    >
                        /timbangan/data
                    </div>

                </div>


                <div>

                    <div class="text-sm text-slate-500">
                        Waktu
                    </div>

                    <div
                        id="timbangan-time"
                        class="mt-1 font-semibold text-slate-700"
                    >
                        --
                    </div>

                </div>

            </div>

        </div>

    </div>

</section>


{{-- MQTT.js --}}
<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>


<script>

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const broker =
            'ws://192.168.1.102:9001';

        const topic =
            '/timbangan/data';


        const status =
            document.getElementById(
                'mqtt-status'
            );

        const value =
            document.getElementById(
                'timbangan-value'
            );

        const device =
            document.getElementById(
                'timbangan-device'
            );

        const time =
            document.getElementById(
                'timbangan-time'
            );

        const topicElement =
            document.getElementById(
                'timbangan-topic'
            );


        console.log(
            'MQTT CONNECT:',
            broker
        );


        const client =
            mqtt.connect(
                broker,
                {
                    username: 'tes',
                    password: 'tes123',

                    clientId:
                        'landing-' +
                        Math.random()
                            .toString(16)
                            .substring(2),

                    clean: true,

                    reconnectPeriod: 5000,

                    connectTimeout: 10000
                }
            );


        /*
        |--------------------------------------------------------------------------
        | CONNECT
        |--------------------------------------------------------------------------
        */

        client.on(
            'connect',
            function () {

                console.log(
                    'MQTT WEBSOCKET CONNECTED'
                );


                status.textContent =
                    'CONNECTED';

                status.className =
                    'mt-3 text-xl font-bold text-emerald-500';


                client.subscribe(
                    topic,
                    function (error) {

                        if (error) {

                            console.error(
                                'SUBSCRIBE ERROR:',
                                error
                            );

                            status.textContent =
                                'SUBSCRIBE ERROR';

                            status.className =
                                'mt-3 text-xl font-bold text-rose-500';

                            return;
                        }


                        console.log(
                            'SUBSCRIBED:',
                            topic
                        );

                    }
                );

            }
        );


        /*
        |--------------------------------------------------------------------------
        | MESSAGE
        |--------------------------------------------------------------------------
        */

        client.on(
            'message',
            function (
                receivedTopic,
                message
            ) {

                console.log(
                    'MQTT MESSAGE:',
                    receivedTopic,
                    message.toString()
                );


                try {

                    const data =
                        JSON.parse(
                            message.toString()
                        );


                    console.log(
                        'DATA:',
                        data
                    );


                    if (
                        data.value !== undefined
                    ) {

                        value.textContent =
                            Number(
                                data.value
                            ).toFixed(2);

                    }


                    if (
                        data.device_id
                    ) {

                        device.textContent =
                            data.device_id;

                    }


                    if (
                        data.time
                    ) {

                        time.textContent =
                            data.time;

                    }


                    topicElement.textContent =
                        receivedTopic;


                } catch (error) {

                    console.error(
                        'JSON ERROR:',
                        error
                    );

                }

            }
        );


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        client.on(
            'error',
            function (error) {

                console.error(
                    'MQTT ERROR:',
                    error
                );

                status.textContent =
                    'ERROR';

                status.className =
                    'mt-3 text-xl font-bold text-rose-500';

            }
        );


        /*
        |--------------------------------------------------------------------------
        | OFFLINE
        |--------------------------------------------------------------------------
        */

        client.on(
            'offline',
            function () {

                console.warn(
                    'MQTT OFFLINE'
                );

                status.textContent =
                    'OFFLINE';

                status.className =
                    'mt-3 text-xl font-bold text-slate-500';

            }
        );


        /*
        |--------------------------------------------------------------------------
        | RECONNECT
        |--------------------------------------------------------------------------
        */

        client.on(
            'reconnect',
            function () {

                console.log(
                    'MQTT RECONNECTING...'
                );

                status.textContent =
                    'RECONNECTING...';

                status.className =
                    'mt-3 text-xl font-bold text-amber-500';

            }
        );

    }
);

</script>