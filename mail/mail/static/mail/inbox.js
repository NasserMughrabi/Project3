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
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#inbox-emails').style.display = 'none';
  document.querySelector('#sent-emails').style.display = 'none';
  document.querySelector('#archive-emails').style.display = 'none';
  document.querySelector('#email-body').style.display = 'none';
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
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-body').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector(`#${mailbox}-emails`).style.display = 'block';
  if(mailbox !== 'inbox') {
    document.querySelector('#inbox-emails').style.display = 'none';
  }
  if(mailbox !== 'sent') {
    document.querySelector('#sent-emails').style.display = 'none';
  }
  if(mailbox !== 'archive') {
    document.querySelector('#archive-emails').style.display = 'none';
  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // show the body of the mailbox page (inbox, sent, archived)
  show_page(mailbox);

}

function show_page(mailbox){

  // send request to API to send us JSON of all emails
  // that belong the choosen mailbox(inbox, sent, archived)
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  console.log(emails);

    emails.forEach(email => {

      const emailDiv = document.createElement('div');

      // Add archive button for inbox emails, unarchive button for archived emails, and no button otherwise
      if(mailbox === 'inbox'){
        emailDiv.innerHTML = `
        <div id="sender-${email.id}" class="email-sender">${email.sender}<div class="email-timestamp">${email.timestamp}</div><div class="email-subject">${email.subject}</div></div><div id="archive-div"><button class="btn btn-sm btn-outline-primary" id="archive-${email.id}">Archive</button></div>
        `;
      } 
      else if(mailbox === 'archive'){
        emailDiv.innerHTML = `
        <div id="sender-${email.id}" class="email-sender">${email.sender}<div class="email-timestamp">${email.timestamp}</div><div class="email-subject">${email.subject}</div></div><div id="unarchive-div"><button class="btn btn-sm btn-outline-primary" id="unarchive-${email.id}">Unarchive</button></div>
        `;
      }
      else {
        emailDiv.innerHTML = `
        <div id="sender-${email.id}" class="email-sender">${email.sender}<div class="email-timestamp">${email.timestamp}</div><div class="email-subject">${email.subject}</div></div>
        `;
      }
      // appending above html element
      document.querySelector(`#${mailbox}-emails`).append(emailDiv);

      // decide background color of email depending on wether it's read or not
      if(email.read && mailbox === 'inbox'){
        document.querySelector(`#sender-${email.id}`).style.backgroundColor = 'grey';
      }
      else {
        document.querySelector(`#sender-${email.id}`).style.backgroundColor = 'white';
      }

      // add eventlisteners to buttons(archive/unarchive) and email divs
      document.querySelector(`#sender-${email.id}`).addEventListener('click', () => show_email(email.id));

      if(mailbox === 'inbox') {
        document.querySelector(`#archive-${email.id}`).addEventListener('click', () => archive_email(email.id));
      }
      else if(mailbox === 'archive'){
        document.querySelector(`#unarchive-${email.id}`).addEventListener('click', () => unarchive_email(email.id));
      }

    });

  });

  // clear out the div from appended elements to avoid cumulation
  document.querySelector(`#${mailbox}-emails`).innerHTML = '';

}

// modify json data in API to mark email as archived
function archive_email(emailId) {
    fetch(`emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })

    load_mailbox('inbox');
}

// modify json data in API to mark email as unarchived
function unarchive_email(emailId) {
    fetch(`emails/${emailId}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })

    load_mailbox('inbox');
}

// when clicked on email, this function gets called to display cetain html elements
// on single email page
function show_email(emailId){

  // Hide all html component leaving email details page (single application page)
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#inbox-emails').style.display = 'none';
  document.querySelector('#sent-emails').style.display = 'none';
  document.querySelector('#archive-emails').style.display = 'none';
  document.querySelector('#email-body').style.display = 'block';

  // access email details using its id and display them on html page(inbox)
  fetch(`emails/${emailId}`)
  .then(response => response.json())
  .then(emailData => {
    console.log(emailData);

    const newEmailDiv = document.createElement('div');
    newEmailDiv.id = 'newEmailDiv';
    newEmailDiv.innerHTML = `
    <div class="title"><div class="from-name">From:</div><div class="title-content">${emailData.sender}</div></div>
    <div class="title"><div class="to-name">To:</div><div class="title-content">${emailData.recipients}</div></div>
    <div class="title"><div class="subject-name">Subject:</div><div class="title-content">${emailData.subject}</div></div>
    <div class="title"><div class="time-name">Timestamp:</div><div class="title-content">${emailData.timestamp}</div></div>
    <div id="reply-div"><button class="btn btn-sm btn-outline-primary" id="reply-button">Reply</button></div>
    <div id="bar"></div>
    <div id="email-content">${emailData.body}</div>
    `;
    // add element to single email view page
    document.querySelector('#email-body').innerHTML = newEmailDiv.innerHTML;

    // id reply button clicked redirct user to compose page with prefill data
    document.querySelector('#reply-button').addEventListener('click', () => reply_email(emailData.sender, emailData.recipients, emailData.subject, emailData.timestamp, emailData.body)); 
  });

  // mark email with emailId as read using put method in the API
  fetch(`emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}


function reply_email(sender, recipients, subject, timeStamp, body) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#inbox-emails').style.display = 'none';
  document.querySelector('#sent-emails').style.display = 'none';
  document.querySelector('#archive-emails').style.display = 'none';
  document.querySelector('#email-body').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  if(subject.startsWith('RE:')){
    document.querySelector('#compose-subject').value = subject;
  }else {
    document.querySelector('#compose-subject').value = 'RE: ' + subject;
  }
  document.querySelector('#compose-body').value = 'On ' + timeStamp + ' ' + sender + ' wrote: ' + body + '\n';


  // send email at submit button click
  document.querySelector('#compose-submit').onclick = send_email;
}