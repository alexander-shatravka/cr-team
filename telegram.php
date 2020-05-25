<?php
    // $service = $_POST['service'] ? $_POST['service'] : 'не указано';
    $name = $_POST['name'];
    $phone = $_POST['phone'];
    // $email = $_POST['email'];
    $message = $_POST['message'];
    // $file = $_POST['file'];

    $token = "696472715:AAEjwnDGbq27F6D6srHGHgNfJyXL_be5XTw";
    $chat_id = "-442444693";

    $arr = array(
        //'услуга: ' => $service,
        'имя: ' => $name,
        'телефон: ' => $phone,
        // 'почта: ' => $email,
        //'сообщение: ' => $message,
        // 'файл: ' => $file
    );

    foreach($arr as $key => $value) {
        $txt .= "<b>".$key."</b> ".$value."%0A";
    };

    //var_dump($txt);
    $sendToTelegram = fopen("https://api.telegram.org/bot{$token}/sendMessage?chat_id={$chat_id}&parse_mode=html&text={$txt}","r");
?>