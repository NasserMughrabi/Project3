document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#inbox-emails').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // send email at submit button click
  document.querySelector('#compose-submit').onclick = send_email;

}

function send_email() {

  // Get the form entered data by the user 
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send the email to recepient using the API(emails/)
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });

  // load user's sent mailbox after sending an email
  load_mailbox('sent');
  return false;

  }

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#inbox-emails').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  show_page(mailbox);

}

function show_page(mailbox){


  // send request to API to send us JSON of all emails that belong the choosen mailbox(inbox, sent, archived)
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  console.log(emails);

    emails.forEach(email => {

      const element = document.createElement('div');
      element.id = 'whole-email';
      element.innerHTML = 
      `<div class="email-sender">${email.sender}</div>
      <div class="email-subject">${email.subject}</div>
      <div class="email-timestamp">${email.timestamp}</div>`;
      element.addEventListener('click', function() {
          console.log('This element has been clicked!')
      });
      
      document.querySelector('#inbox-emails').append(element);
    });

    

  });

  

}