<?php

require '/var/www/html/prototype/vendor/autoload.php';

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

$host = '192.168.3.253';
$port = 1883;
$clientId = 'container-subscriber';

$settings = (new ConnectionSettings())
    ->setUsername('tes')
    ->setPassword('tes123')
    ->setKeepAliveInterval(60)
    ->setConnectTimeout(5);

$topic = '/timbangan/data';

try {

    echo "Menghubungkan ke MQTT {$host}:{$port}...\n";

    $mqtt = new MqttClient(
        $host,
        $port,
        $clientId
    );

    $mqtt->connect($settings, true);

    echo "MQTT CONNECT BERHASIL!\n";
    echo "Subscribe topic: {$topic}\n";
    echo "Menunggu data...\n";
    echo "Tekan CTRL+C untuk berhenti.\n\n";

    $mqtt->subscribe(
        $topic,
        function (string $topic, string $message) {

            echo "========================================\n";
            echo "TOPIC   : {$topic}\n";
            echo "MESSAGE : {$message}\n";
            echo "TIME    : " . date('Y-m-d H:i:s') . "\n";
            echo "========================================\n\n";

        },
        0
    );

    $mqtt->loop(true);

} catch (\Throwable $e) {

    echo "\nMQTT ERROR\n";
    echo "Class   : " . get_class($e) . "\n";
    echo "Message : " . $e->getMessage() . "\n";

}