"use strict";

window.addEventListener("DOMContentLoaded", start);

const allStudents = []; // Empty students array
const Student = {
  // Student object prototype
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  gender: "",
  house: "",
  photo: "",
  bloodType: "",
  isPrefect: false,
  isMemberOfInqSquad: false,
  canBeExpelled: true,
};

let currentFilter = "all"; // Default current filter
let currentSort; // Global variable for current sorting
let sortDirection; // Global variable for current sort direction
let familyBlood = {}; // Global variable to detemine each students blood type
let expelledStudents = []; // Global array for expelled students
let inqSquad = []; // Global array for inq squad members
let prefects = {
  Gryffindor: [],
  Hufflepuff: [],
  Ravenclaw: [],
  Slytherin: [],
}; // Global object with house arrays for prefects
let hasBeenHacked = false; // Global variable used to keep track of hacking status
let n = 0; // Counter for the hacking sequence

function start() {
  console.log("ready");

  document.querySelectorAll(".filter-dropdown button").forEach((knap) => {
    knap.addEventListener("click", selectFilter);
  });

  document.querySelectorAll(".sort-dropdown button").forEach((knap) => {
    knap.addEventListener("click", selectSort);
  });

  document.querySelector("#search-input").addEventListener("input", filterSearch);

  document.querySelector("footer button").addEventListener("click", hackTheSystem);

  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
  loadJSON("https://petlatkea.dk/2020/hogwarts/families.json", prepareFamilyBlood);
}

// Load JSON-data with use of callback function
async function loadJSON(url, callback) {
  const response = await fetch(url);
  const data = await response.json();
  callback(data);
}

// Clean the student data and use prototypes to manage their correct data
function prepareObjects(jsonData) {
  console.log(jsonData);
  jsonData.forEach((jsonObject) => {
    const fullName = jsonObject.fullname.trim();

    let house = jsonObject.house.trim();
    house = house.substring(0, 1).toUpperCase() + house.substring(1).toLowerCase();
    let gender = jsonObject.gender.trim();
    gender = gender.substring(0, 1).toUpperCase() + gender.substring(1).toLowerCase();

    let firstName;
    if (fullName.includes(" ")) {
      firstName = fullName.substring(0, fullName.indexOf(" "));
      firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();
    } else {
      firstName = fullName;
    }

    let middleName;
    if (fullName.includes(" ") && fullName.lastIndexOf(" ") >= 0 && !fullName.includes('"')) {
      middleName = fullName.substring(fullName.indexOf(" ") + 1, fullName.lastIndexOf(" ")).trim();
      middleName = middleName.substring(0, 1).toUpperCase() + middleName.substring(1).toLowerCase();
      middleName = middleName.trim();
      if (middleName.length === 0) {
        middleName = null;
      }
    } else {
      middleName = null; //IF STUDENT DOESN'T HAVE MIDDLE NAME
    }

    let nickName;
    if (fullName.includes('"')) {
      nickName = fullName.substring(fullName.indexOf(" ") + 1, fullName.lastIndexOf(" "));
      nickName = nickName.trim();
      nickName = nickName.replaceAll('"', "").trim();
      nickName = nickName.substring(0, 1).toUpperCase() + nickName.substring(1).toLowerCase();
    } else {
      nickName = null; //IF STUDENT DOESN'T HAVE NICK NAME
    }

    let lastName;
    if (fullName.includes(" ")) {
      lastName = fullName.substring(fullName.lastIndexOf(" ")).trim();
      if (lastName.includes("-")) {
        lastName =
          lastName.substring(0, lastName.indexOf("-")) +
          lastName.substring(lastName.indexOf("-"), lastName.indexOf("-") + 2).toUpperCase() +
          lastName.substring(lastName.indexOf("-") + 2).toLowerCase();
      } else {
        lastName = lastName.substring(0, 1).toUpperCase() + lastName.substring(1).toLowerCase();
      }
    } else {
      lastName = null; //IF STUDENT DOESN'T HAVE LAST NAME
    }

    let photo = lastName + "_" + firstName.substring(0, 1) + ".png";
    if (photo.includes("-")) {
      photo = photo.substring(photo.indexOf("-") + 1);
    }

    if (photo.includes("Patil")) {
      photo = lastName + "_" + firstName + ".png";
    }

    if (photo.includes("null")) {
      photo = "unknown.svg";
    }

    photo = photo.toLowerCase();

    const cleanedObject = Object.create(Student);

    cleanedObject.firstName = firstName;
    cleanedObject.middleName = middleName;
    cleanedObject.nickName = nickName;
    cleanedObject.lastName = lastName;
    cleanedObject.gender = gender;
    cleanedObject.house = house;
    cleanedObject.photo = photo;

    allStudents.push(cleanedObject);
  });

  console.table(allStudents);
  displayList(allStudents);
}

// Set each students blood type properly according to their parents'
function prepareFamilyBlood(jsonData) {
  familyBlood = jsonData;
  console.log(familyBlood);

  allStudents.forEach((student) => {
    if (familyBlood.pure.includes(student.lastName) === true && familyBlood.half.includes(student.lastName) === false) {
      student.bloodType = "Pure blood";
    } else if (familyBlood.pure.includes(student.lastName) === true && familyBlood.half.includes(student.lastName) === true) {
      student.bloodType = "Pure blood";
    } else if (familyBlood.pure.includes(student.lastName) === false && familyBlood.half.includes(student.lastName) === true) {
      student.bloodType = "Half blood";
    } else {
      student.bloodType = "Muggle blood";
    }
  });
}

// Get the search input from the user and send it to buildList
function filterSearch() {
  const searchValue = this.value;
  currentFilter = searchValue;
  console.log(searchValue);
  buildList(searchValue);
}

// Search the list by input text
function searchList(allStudents) {
  if (currentFilter.length === 0 || currentFilter === "" || currentFilter === null) {
    return allStudents;
  } else {
    const list = allStudents.filter((student) => {
      if (
        student.firstName.toLowerCase().includes(currentFilter.toLowerCase()) ||
        (student.middleName !== null && student.middleName.toLowerCase().includes(currentFilter.toLowerCase())) ||
        (student.nickName !== null && student.nickName.toLowerCase().includes(currentFilter.toLowerCase())) ||
        (student.lastName !== null && student.lastName.toLowerCase().includes(currentFilter.toLowerCase()))
      ) {
        return true;
      } else {
        return false;
      }
    });
    console.log(list);
    return list;
  }
}

// Get selected filter option and send it to setFilter function
function selectFilter() {
  const clicledFilter = this;
  setFilter(clicledFilter);
}

// Set the currentFilter to the clicked filter
function setFilter(clickedFilter) {
  document.querySelectorAll(".filter-dropdown button").forEach((knap) => {
    knap.classList.remove("selected");
  });
  clickedFilter.classList.add("selected");

  currentFilter = clickedFilter.dataset.filter;

  document.querySelector(".filter-heading p").textContent = `Filter by: ${currentFilter}`;
  document.querySelector(".filter-heading i").classList = "";

  console.log(currentFilter);
  buildList();
}

// Filter the list by currentFilter
function filterList(allStudents) {
  if (currentFilter === "all" || currentFilter.length === 0) {
    return allStudents;
  } else if (currentFilter === "prefect") {
    const list = allStudents.filter((student) => student.isPrefect === true);
    return list;
  } else if (currentFilter === "expelled") {
    const list = expelledStudents;
    return list;
  } else {
    const list = allStudents.filter((student) => student.house === currentFilter);
    return list;
  }
}

// Get selected sort option and send it to setSort function
function selectSort() {
  const clickedSort = this;
  const direction = this.dataset.sortDirection;
  setSort(clickedSort, direction);

  const clickedSortButton = this;
  changeSortDirection(clickedSortButton, direction);
}

// Change sort direction accordingly to clicked sorting option
function changeSortDirection(clickedSortButton, direction) {
  document.querySelectorAll(".sort-dropdown button").forEach((knap) => {
    knap.dataset.sortDirection = "asc";
  });

  document.querySelector(".sort-heading p").textContent = "";

  if (currentSort === "firstName") {
    document.querySelector(".sort-heading p").textContent = `Sort by: First Name`;
  } else if (currentSort === "lastName") {
    document.querySelector(".sort-heading p").textContent = `Sort by: Last Name`;
  } else if (currentSort === "isMemberOfInqSquad") {
    document.querySelector(".sort-heading p").textContent = `Sort by: Inquisitorial`;
  } else if (currentSort === "isPrefect") {
    document.querySelector(".sort-heading p").textContent = `Sort by: Prefects`;
  } else {
    document.querySelector(".sort-heading p").textContent = `Sort by: ${currentSort}`;
  }

  if (direction === "asc") {
    clickedSortButton.dataset.sortDirection = "desc";
    document.querySelector(".sort-heading i").classList = "arrow up";
  } else {
    clickedSortButton.dataset.sortDirection = "asc";
    document.querySelector(".sort-heading i").classList = "arrow down";
  }
}

// Display selected sorting method in dropdown
function setSort(clickedSort, direction) {
  document.querySelectorAll(".sort-dropdown button").forEach((knap) => {
    knap.classList.remove("selected");
  });
  clickedSort.classList.add("selected");

  currentSort = clickedSort.dataset.sort;
  sortDirection = direction;
  console.log(currentSort, sortDirection);
  buildList();
}

// Sort students with currentSort method
function sortList(currentList) {
  let sortedList;

  currentList.sort(sortByProperty);
  console.log(currentSort);

  function sortByProperty(a, b) {
    if (sortDirection === "asc") {
      if (a[currentSort] < b[currentSort]) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (b[currentSort] < a[currentSort]) {
        return -1;
      } else {
        return 1;
      }
    }
  }
  return sortedList;
}

// Make the student array with filter and sorting in mind
function buildList(searchValue) {
  let currentList;
  if (searchValue !== undefined) {
    currentList = searchList(allStudents);
  } else {
    currentList = filterList(allStudents);
  }

  sortList(currentList);
  displayList(currentList);
}

// Send each student object in the allStudents array to displayStudent function
function displayList(students) {
  document.querySelector("#all-students").innerHTML = "";
  if (hasBeenHacked === true) {
    randomizeBloodType();
    students.forEach(displayStudent);
    console.log("hacked");
  } else {
    students.forEach(displayStudent);
    console.log("not hacked yet");
  }

  document.querySelector(".students-gryffindor").textContent = "Students in Gryffindor: " + allStudents.filter((student) => student.house === "Gryffindor").length;
  document.querySelector(".students-hufflepuff").textContent = "Students in Hufflepuff: " + allStudents.filter((student) => student.house === "Hufflepuff").length;
  document.querySelector(".students-ravenclaw").textContent = "Students in Ravenclaw: " + allStudents.filter((student) => student.house === "Ravenclaw").length;
  document.querySelector(".students-slytherin").textContent = "Students in Slytherin: " + allStudents.filter((student) => student.house === "Slytherin").length;

  document.querySelector(".students-total").textContent = "Students in total: " + allStudents.length;
  document.querySelector(".students-expelled").textContent = "Students expelled: " + expelledStudents.length;
}

// Display each student
function displayStudent(student) {
  let studentContainer = document.querySelector("#all-students");
  let studentTemplate = document.querySelector("#student-template");

  let clone = studentTemplate.cloneNode(true).content;
  clone.querySelector("p").textContent = student.house;
  clone.querySelector("img").src = `images/${student.photo}`;
  clone.querySelector("img").alt = student.firstName;
  validateName(clone, student);

  clone.querySelector(".student").addEventListener("click", () => {
    displayStudentModal(student);
  });

  studentContainer.appendChild(clone);
}

// Checks if the student has any middlename, nickname or lastname and displays their full name accordingly
function validateName(clone, student) {
  clone.querySelector("h3").textContent = `${student.firstName}`;

  if (student.middleName !== null) {
    clone.querySelector("h3").textContent += `  ${student.middleName}`;
  }

  if (student.nickName !== null) {
    clone.querySelector("h3").textContent += ` "${student.nickName}"`;
  }

  if (student.lastName !== null) {
    clone.querySelector("h3").textContent += ` ${student.lastName}`;
  }
}

// Show modal for clicked student
function displayStudentModal(student) {
  document.querySelector("#student-modal").innerHTML = "";

  let ModalContainer = document.querySelector("#student-modal");
  let ModalTemplate = document.querySelector("#modal-template");

  let clone = ModalTemplate.cloneNode(true).content;

  const modal = document.querySelector("#student-modal");
  const modalFullName = clone.querySelector(".student-fullname");
  const modalCredentials = clone.querySelector(".student-credentials");
  const modalPhoto = clone.querySelector(".student-modal-photo");
  const modalCrest = clone.querySelector(".house-crest img");
  const modalFrame = clone.querySelector(".info-container");

  modalFrame.style.setProperty("--primary-color", `var(--${student.house.toLowerCase()}-primary)`);
  modalFrame.style.setProperty("--secondary-color", `var(--${student.house.toLowerCase()}-secondary)`);

  modal.style.display = "flex"; // Display the modal
  modalFullName.textContent = student.firstName; // Display student first name
  modalCredentials.querySelector("p").textContent = `First name: ${student.firstName}`;

  // Display student middel name
  if (student.middleName !== null) {
    modalFullName.textContent += `  ${student.middleName}`;
    modalCredentials.querySelector("p:nth-child(2)").textContent = `Middle name: ${student.middleName}`;
  } else {
    modalCredentials.querySelector("p:nth-child(2)").textContent = "";
  }

  // Display student nick name
  if (student.nickName !== null) {
    modalFullName.textContent += ` "${student.nickName}"`;
    modalCredentials.querySelector("p:nth-child(3)").textContent = `Nick name: ${student.nickName}`;
  } else {
    modalCredentials.querySelector("p:nth-child(3)").textContent = "";
  }

  // Display student last name
  if (student.lastName !== null) {
    modalFullName.textContent += ` ${student.lastName}`;
    modalCredentials.querySelector("p:nth-child(4)").textContent = `Last name: ${student.lastName}`;
  } else {
    modalCredentials.querySelector("p:nth-child(4)").textContent = "";
  }

  modalCredentials.querySelector("p:nth-child(5)").textContent = `Blood status: ${student.bloodType}`;

  if (student.isPrefect === true) {
    clone.querySelector(".prefect").textContent = "Revoke prefect";
    modalCredentials.querySelector("p:nth-child(6)").textContent = `Prefect status: ${student.firstName} is prefect!`;
  } else {
    modalCredentials.querySelector("p:nth-child(6)").textContent = `Prefect status: ${student.firstName} is not prefect!`;
    clone.querySelector(".prefect").textContent = "Prefect student";
  }

  if (student.isMemberOfInqSquad === true) {
    clone.querySelector(".inquisitorial").textContent = "Revoke inquisitorial membership";
    modalCredentials.querySelector("p:nth-child(7)").textContent = `Inquisitorial squad status: Member!`;
  } else {
    clone.querySelector(".inquisitorial").textContent = "Add to inquisitorial squad";
    modalCredentials.querySelector("p:nth-child(7)").textContent = `Inquisitorial squad status: Not a member!`;
  }

  if (student.bloodType !== "Pure blood") {
    clone.querySelector(".inquisitorial").classList.add("disabled");
    clone.querySelector(".inquisitorial").disabled = true;
    clone.querySelector(".inquisitorial").textContent = "Only pure-bloods can join the squad!";
  }

  modalPhoto.src = `images/${student.photo}`; // Display student photo
  modalPhoto.alt = student.firstName;

  modalCrest.src = `images/${student.house}.png`; // Display student house crest
  modalCrest.alt = `images/${student.house}.png`;

  document.querySelector("body").style.overflow = "hidden"; // Disable list movement to create focus on modal

  if (allStudents.includes(student)) {
    clone.querySelector(".prefect").addEventListener("click", prefectClick);
    function prefectClick() {
      checkPrefectStatus(student);
    }

    clone.querySelector(".inquisitorial").addEventListener("click", inquisitorialClick);
    function inquisitorialClick() {
      toggleInquisitorial(student);
    }

    clone.querySelector(".expel").addEventListener("click", expelClick);
    function expelClick() {
      document.querySelector(".info-container").classList.add("fade-out");
      document.querySelector(".info-container").addEventListener("animationend", () => {
        modal.style.display = "none";
        document.querySelector("body").style.overflow = "visible";
      });
      expelStudent(student);
    }
  } else {
    clone.querySelectorAll(".student-actions button").forEach((button) => {
      button.classList.add("disabled");
      button.disabled = true;
    });
  }

  // Hack the system below
  if (hasBeenHacked === true) {
    // modal.style.top = "-80px";
  }

  if (student.canBeExpelled === false) {
    clone.querySelector(".expel").textContent = `Cannot be expelled!`;
    clone.querySelector(".expel").classList.add("disabled");
    clone.querySelector(".expel").disabled = true;
  }

  ModalContainer.appendChild(clone);

  document.querySelector(".info-container").classList.add("fade-in");
  document.querySelector(".info-container").addEventListener("animationend", () => {
    document.querySelector(".info-container").classList.remove("fade-in");
  });

  document.querySelector(".close-info").addEventListener("click", () => {
    document.querySelector(".info-container").classList.add("fade-out");
    document.querySelector(".info-container").addEventListener("animationend", () => {
      modal.style.display = "none";
      document.querySelector("body").style.overflow = "visible";
    });
  });
}

function checkPrefectStatus(student) {
  const currentHouse = student.house;

  if (student.isPrefect === false && prefects[currentHouse].includes(student) === false && prefects[currentHouse].length < 2) {
    addPrefect(student, currentHouse);
  } else if (student.isPrefect === true && prefects[currentHouse].includes(student) === true && prefects[currentHouse].length >= 2) {
    revokePrefect(student, currentHouse);
  } else if (student.isPrefect === true && prefects[currentHouse].includes(student) === true && prefects[currentHouse].length < 2) {
    revokePrefect(student, currentHouse);
  } else {
    decidePrefect(student, currentHouse);
  }
}

function decidePrefect(student, currentHouse) {
  document.querySelector(".prefect-container").classList.remove("hide");
  document.querySelector(".student-info").classList.add("hide");
  document.querySelector(".student-actions").classList.add("hide");
  document.querySelector(".prefect-container p").textContent = `Two prefects already exist in ${currentHouse}`;

  document.querySelector("[data-prefect]:first-child").textContent = `Remove ${prefects[currentHouse][0].firstName}`;
  document.querySelector("[data-prefect]:nth-child(2)").textContent = `Remove ${prefects[currentHouse][1].firstName}`;
  document.querySelector("[data-prefect]:nth-child(3)").textContent = `Cancel`;

  document.querySelectorAll("[data-prefect]").forEach((button) => {
    button.addEventListener("click", clickDecidePrefect);
  });

  function clickDecidePrefect() {
    const selectedDecision = this.dataset.prefect;
    console.log(selectedDecision);
    if (selectedDecision === "0" || selectedDecision === "1") {
      removePrefect(student, currentHouse, selectedDecision);
    } else {
      closePrefect();
    }
  }
  console.log(prefects);
}

function addPrefect(student, currentHouse) {
  student.isPrefect = true;
  prefects[currentHouse].push(student);
  console.log(prefects);
  displayStudentModal(student);
}

function revokePrefect(student, currentHouse) {
  console.log("revoke");
  student.isPrefect = false;
  prefects[currentHouse].splice(prefects[currentHouse].indexOf(student), 1);
  displayStudentModal(student);
}

function removePrefect(student, currentHouse, selectedDecision) {
  prefects[currentHouse][selectedDecision].isPrefect = false;
  prefects[currentHouse].splice(selectedDecision, 1);
  addPrefect(student, currentHouse);
  closePrefect();
}

function closePrefect() {
  document.querySelector(".prefect-container").classList.add("hide");
  document.querySelector(".student-info").classList.remove("hide");
  document.querySelector(".student-actions").classList.remove("hide");
}

function toggleInquisitorial(student) {
  if (hasBeenHacked === false) {
    if (student.bloodType === "Pure blood") {
      student.isMemberOfInqSquad = !student.isMemberOfInqSquad;
      console.log(student);
    } else {
      console.log(`${student.firstName} is not pure blood!`);
    }
    displayStudentModal(student);
  } else {
    if (student.bloodType === "Pure blood" && student.isMemberOfInqSquad === false) {
      setTimeout(toggleInquisitorial, 1000, student);
      student.isMemberOfInqSquad = !student.isMemberOfInqSquad;
      console.log(student);
    } else if (student.bloodType === "Pure blood" && student.isMemberOfInqSquad === true) {
      student.isMemberOfInqSquad = !student.isMemberOfInqSquad;
      console.log(student);
    } else {
      console.log(`${student.firstName} is not pure blood!`);
    }
    displayStudentModal(student);
  }
}

function expelStudent(student) {
  console.log(`${student.firstName} is now expelled`);

  expelledStudents.push(student);
  student.isMemberOfInqSquad = false;
  student.isPrefect = false;
  allStudents.splice(allStudents.indexOf(student), 1);

  displayList(allStudents);
}

function hackTheSystem() {
  // General hacking settings
  window.scrollTo(0, 0);
  document.querySelector("main").classList.add("hacked-intro");
  document.querySelector(".hogwarts-info-container h1").classList.add("typewritten");
  document.querySelector("main").addEventListener("animationend", typewrite);

  document.querySelector("footer button").removeEventListener("click", hackTheSystem);
  document.querySelector("footer button").disabled = true;
  document.querySelector("footer button").classList.add("disabled");
  document.querySelector("footer button").textContent = "hacked";
  console.log("hacked");
  document.querySelector("footer audio").volume = 0.1;
  document.querySelector("footer audio").play();

  // Injecting myself
  const myself = Object.create(Student);
  myself.firstName = "Nicolai";
  myself.middleName = "H.";
  myself.nickName = null;
  myself.lastName = "Jørgensen";
  myself.gender = "Boy";
  myself.house = "Gryffindor";
  myself.photo = "jurgen2.png";
  myself.bloodType = "Pure blood";
  myself.canBeExpelled = false;

  randomizeBloodType(); // Randomize blood-status for pure-bloods
  hasBeenHacked = true; // Setting global variable up for hacking settings

  // Final injections
  allStudents.unshift(myself);
  displayList(allStudents);
}

function randomizeBloodType() {
  allStudents.forEach((student) => {
    if (student.bloodType === "Pure blood" && student.canBeExpelled === true) {
      const newBloodTypes = ["Pure blood", "Half blood", "Muggle blood"];
      console.log(student.bloodType);
      student.bloodType = newBloodTypes[Math.floor(Math.random() * newBloodTypes.length)];
      console.log(student.bloodType);
    } else {
      student.bloodType = "Pure blood";
      console.log(student.bloodType);
    }
  });
}

function typewrite() {
  document.querySelector("main").classList.remove("hacked-intro");
  document.querySelector(".typewritten").textContent = "Hacked Hogwarts";
  const text = document.querySelector(".typewritten").textContent;
  document.querySelector(".typewritten").textContent = "";
  console.log(text);

  const newText = text.substring(0, n + 1);
  console.log(newText);
  document.querySelector(".typewritten").textContent = newText;

  if (n === text.length) {
    console.log("sentence finished");
    n = 0;
  } else {
    n++;
    setTimeout(typewrite, 150);
  }
}
