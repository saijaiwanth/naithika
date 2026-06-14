<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Load PHPMailer via Composer

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Collect form inputs safely
    $name    = isset($_POST['name']) ? $_POST['name'] : '';
    $email   = isset($_POST['email']) ? $_POST['email'] : '';
    $subject = isset($_POST['subject']) ? $_POST['subject'] : '';
    $message = isset($_POST['message']) ? $_POST['message'] : '';

    $mail = new PHPMailer(true);

    try {
        // Gmail SMTP configuration
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'naithikafoods@gmail.com'; // your Gmail address
        $mail->Password   = 'rlehmfsogwgvenaz';  // Gmail App Password
        $mail->SMTPSecure = 'ssl';
        $mail->Port       = 465;

        // Sender & recipient
        $mail->setFrom('naithikafoods@gmail.com', 'Naithika Foods');
        $mail->addAddress('naithikafoods@gmail.com'); 
        if (!empty($email)) {
            $mail->addReplyTo($email, $name);
        }

        // Email content
        $mail->isHTML(true);
        $mail->Subject = 'New Submission from Website';
        $mail->Body    = "
            <h2>New Submission</h2>
            <p><b>Name:</b> {$name}</p>
            <p><b>Email:</b> {$email}</p>
            <p><b>Subject:</b> {$subject}</p>
            <p><b>Message:</b><br>{$message}</p>
        ";

        // Send email
        $mail->send();

        // Redirect with success message
        echo "<script>
                sessionStorage.setItem('toastMsg', 'Details submitted successfully.');
                window.location.href = 'contact.html';
              </script>";
    } catch (Exception $e) {
        // Redirect with failure message
        echo "<script>
                sessionStorage.setItem('toastMsgError', 'Error sending email. Please try again later.');
                window.location.href = 'contact.html';
              </script>";
    }
}
?>

