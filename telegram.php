<?php
    // $service = $_POST['service'] ? $_POST['service'] : 'не указано';
    $name = $_POST['name'];
    $phone = $_POST['phone'];
    // $email = $_POST['email'];
    $message = $_POST['message'];
    // $file = $_POST['file'];

    $token = "1124038621:AAF0Zb5-5yi6D0mpA7EanhiYBVJdmvXFGWc";
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