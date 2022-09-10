let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");

closeBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});

searchBtn.addEventListener("click", () => {
  // Sidebar open when you click on the search iocn
  sidebar.classList.toggle("open");
  menuBtnChange(); //calling the function(optional)
});

// following are the code to change sidebar button(optional)
function menuBtnChange() {
  if (sidebar.classList.contains("open")) {
    closeBtn.classList.replace("bx-menu", "bx-menu-alt-right"); //replacing the iocns class
  } else {
    closeBtn.classList.replace("bx-menu-alt-right", "bx-menu"); //replacing the iocns class
  }
}

/* This is a function that is called when the user clicks on the button with the class "new-task".
This display a form whit the corresponding fields */
let newTaskbtn = document.querySelector(".new-task");
var csrfToken = document.getElementById("_csrf").value;

newTaskbtn.addEventListener("click", async () => {
  const { value: task } = await Swal.fire({
    title: "Input your new task",
    html: `<form method="POST" action="/create-task" id="frm-new-task"> 
          <input id="content" type="text" class="form-control border-secondary border border-2"  placeholder="Enter your new task" name="Task" required>
          <input type="hidden" value="1" name="UserId">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          </form>`,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      return [document.getElementById("content").value];
    },
  });

  if (task) {
    /* This is a validation to check if the user has entered a task. If the user has not entered a
    task, it will show an error message. If the user has entered a task, it will submit the form. */
    if (task.filter(Boolean).length < 1) {
      Swal.fire("Error!", "Task content cannot be empty", "error");
    } else {
      let form = document.querySelector("#frm-new-task");
      form.submit();
    }
  }
});

/**
 * It takes the content of the task, the task id and the place where the task is located (inbox, today,
 * week, month or someday) and then it opens a modal where the user can edit the task
 * @param content - The content of the task
 * @param taskId - the id of the task to be edited
 * @param place - is the place where the task is located. It can be either "todo" or "done"
 */
async function EditTask(content, taskId, place) {
  const { value: task } = await Swal.fire({
    title: "Update your task",
    html: `<form method="POST" action="/edit-task/${place}" id="frm-edit-task"> 
          <input id="content" type="text" class="form-control border-secondary border border-2"  placeholder="Enter your new task" name="Task" value='${content}' required>
          <input type="hidden" value='${taskId}' name="TaskId">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          </form>`,
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      return [document.getElementById("content").value];
    },
  });

  if (task) {
    /* A validation to check if the user has entered a task. If the user has not entered a
        task, it will show an error message. If the user has entered a task, it will submit the
    form. */
    if (task.filter(Boolean).length < 1) {
      Swal.fire("Error!", "Task content cannot be empty", "error");
    } else {
      let form = document.querySelector("#frm-edit-task");
      form.submit();
    }
  }
}

/**
 * It creates a form, adds the taskId and csrfToken to it, appends it to the body, and submits it for delete this task
 * @param taskId - The id of the task to be deleted
 * @param place - The place where the task is located.
 */
function DeleteTask(taskId, place) {
  Swal.fire({
    title: `Are you sure you want to delete this task?`,
    text: "Once it has been deleted it cannot be recovered.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Delete",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", `Task deleted successfully`, "success");

      setTimeout(() => {
        let form = document.createElement("form");
        form.action = `/delete-task/${place}`;
        form.method = "POST";

        let inputTaskId = document.createElement("input");
        inputTaskId.type = "hidden";
        inputTaskId.name = "TaskId";
        inputTaskId.value = `${taskId}`;

        let inputToken = document.createElement("input");
        inputToken.type = "hidden";
        inputToken.name = "_csrf";
        inputToken.value = `${csrfToken}`;

        form.appendChild(inputTaskId);
        form.appendChild(inputToken);

        document.body.append(form);
        form.submit();
      }, 1000);
    }
  });
}

/**
 * It's a function that opens a modal with a form, and when the user clicks on the submit button, it
 * validates the form and if it's valid, it submits the form for update the profile information of a temporal user.
 * @param userId - The user's id.
 * @param fullName - The user's full name.
 */
async function UpdateTemporalProfile(userId, fullName) {
  const { value: formValues } = await Swal.fire({
    title: "Update your profile",
    html: `
          <label" class="form-label text-secondary text-center mt-2 fw-bold">Just fill in the fields you want to update.</label>
          <form method="POST" action="/update-temporal-profile" id="frm-update-temporal-profile">
          <label for="fullName" class="form-label text-dark float-start mt-2 fw-bold">Full Name</label>
          <input id="fullName" type="text" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your new full name" name="FullName" value='${fullName}' required>
          <label for="userName" class="form-label text-dark float-start fw-bold">Username</label>
          <input id="username" type="text" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your new username" name="Username" required>
          <label for="password" class="form-label text-dark float-start fw-bold">New Password</label>
          <input id="password" type="password" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your new password" name="Password" required>
          <label for="confirmPassword" class="form-label text-dark float-start fw-bold">Confirm New Password</label>
          <input id="confirmPassword" type="password" class="form-control border-secondary border border-2 mb-3"  placeholder="Confirm your new password" name="ConfirmPassword" required>
          <input type="hidden" value='${userId}' name="UserId">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          </form>`,
    showCancelButton: true,

    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("fullName").value,
        document.getElementById("username").value,
        document.getElementById("password").value,
        document.getElementById("confirmPassword").value,
      ];
    },
  });

  if (formValues) {
    /* It's a validation to check if the user has entered a task. If the user has not entered a
           task, it will show an error message. If the user has entered a task, it will submit the
       form. */
    if (formValues.filter(Boolean).length < 1) {
      Swal.fire("Error!", "You must complete at least one field.", "error");
    } else if (formValues[2] !== formValues[3]) {
      Swal.fire("Error!", "Password and confirm password no equals", "error");
    } else {
      let form = document.querySelector("#frm-update-temporal-profile");
      form.submit();
    }
  }
}

/**
 * It's a function that opens a modal with a form, and when the user clicks on the submit button, it
 * validates the form and if it's valid, it submits the form for update the profile information of a permanent user.
 * @param userId - The user's id.
 * @param fullName - The user's full name.
 */
async function UpdatePermanentProfile(userId) {
  const { value: formValues } = await Swal.fire({
    title: "Update your profile",
    html: `
           <label" class="form-label text-secondary text-center mt-2 fw-bold">Just fill in the fields you want to update and your current password</label>
          <form method="POST" action="/update-permanent-profile" id="frm-update-permanent-profile">
          <label for="fullName" class="form-label text-dark float-start mt-2 fw-bold">Full Name</label>
          <input id="fullName" type="text" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your new full name" name="FullName" required>
          <label for="userName" class="form-label text-dark float-start fw-bold">Username</label>
          <input id="username" type="text" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your new username" name="Username" required>
          <label for="currentlyPassword" class="form-label text-dark float-start fw-bold">Currently Password<i class="text-danger ms-0">*</i></label>
          <input id="currentlyPassword" type="password" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your last password" name="CurrentlyPassword" required>
          <label for="password" class="form-label text-dark float-start fw-bold">Password</label>
          <input id="password" type="password" class="form-control border-secondary border border-2 mb-3"  placeholder="Enter your new password" name="Password" required>
          <label for="confirmPassword" class="form-label text-dark float-start fw-bold">Confirm Password</label>
          <input id="confirmPassword" type="password" class="form-control border-secondary border border-2 mb-3"  placeholder="Confirm your new password" name="ConfirmPassword" required>
          <input type="hidden" value='${userId}' name="UserId">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          </form>`,
    showCancelButton: true,

    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("fullName").value,
        document.getElementById("username").value,
        document.getElementById("currentlyPassword").value,
        document.getElementById("password").value,
        document.getElementById("confirmPassword").value,
      ];
    },
  });

  if (formValues) {
    /* It's a validation to check if the user has entered a task. If the user has not entered a
           task, it will show an error message. If the user has entered a task, it will submit the
       form. */
    if (formValues.filter(Boolean).length < 1) {
      Swal.fire("Error!", "You must complete at least one field.", "error");
    } else if (formValues[2] === "") {
      Swal.fire("Error!", "You must insert your current password.", "error");
    } else if (formValues[3] !== formValues[4]) {
      Swal.fire("Error!", "Password and confirm password no equals", "error");
    } else {
      let form = document.querySelector("#frm-update-permanent-profile");
      form.submit();
    }
  }
}
