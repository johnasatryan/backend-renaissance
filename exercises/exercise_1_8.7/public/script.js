// document.getElementById('fileuploader').addEventListener('submit', (event) => {
//   event.preventDefault();

//   const file = document.getElementById('file').files[0];
//   const reader = new FileReader();
//   reader.onload = () => {
//     const base64File = reader.result.split(',')[1];

//     fetch('/api/uploads', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ file: base64File, fileName: file.name }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data);
//         alert('File uploaded successfully ');
//       })
//       .catch((err) => console.log(err));
//   };
//   reader.readAsDataURL(file);
// });

document.getElementById('fileFormData').addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData();

  const file = document.getElementById('file').files[0];

  formData.append('file', file);
  formData.append('email', 'example@gmail.com');
  formData.append('isAdmin', false);
  fetch('/api/uploads-multer', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      alert('File uploaded successfully');
    });
});
