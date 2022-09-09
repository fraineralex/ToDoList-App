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

let newTaskbtn = document.querySelector(".new-task");
var csrfToken = document.getElementById('_csrf').value;

newTaskbtn.addEventListener("click", async () => {
  const { value: task } = await Swal.fire({
    title: "Input your new task",
    html: `<form method="POST" action="/create-task" id="frm-new-task"> 
          <input type="text" class="form-control border-secondary border border-2"  placeholder="Enter your new task" name="Task" required>
          <input type="hidden" value="1" name="UserId">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          </form>`,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });

  if (task) {
    let form = document.querySelector("#frm-new-task");
    form.submit();
  }
});

async function EditTask(content, taskId, place) {
  const { value: task } = await Swal.fire({
    title: "Update your task",
    html: `<form method="POST" action="/edit-task/${place}" id="frm-edit-task"> 
          <input type="text" class="form-control border-secondary border border-2"  placeholder="Enter your new task" name="Task" value='${content}' required>
          <input type="hidden" value='${taskId}' name="TaskId">
          <input type="hidden" name="_csrf" value="${csrfToken}">
          </form>`,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });

  if (task) {
    let form = document.querySelector("#frm-edit-task");
    form.submit();
  }
}

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
