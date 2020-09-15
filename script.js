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
  isMemberOfInqSquard: false,
};

let currentFilter = "all";
let currentSort;
let sortDirection;

function start() {
  console.log("ready");

  document.querySelectorAll(".filter-dropdown button").forEach((knap) => {
    knap.addEventListener("click", selectFilter);
  });

  document.querySelectorAll(".sort-dropdown button").forEach((knap) => {
    knap.addEventListener("click", selectSort);
  });

  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
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
    // TODO: Create new object with cleaned data - and store that in the allAnimals array

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

// Get selected filter option and send it to setFilter function
function selectFilter() {
  const clicledFilter = this;
  setFilter(clicledFilter);
}

function setFilter(clickedFilter) {
  document.querySelectorAll(".filter-dropdown button").forEach((knap) => {
    knap.classList.remove("selected");
  });
  clickedFilter.classList.add("selected");

  currentFilter = clickedFilter.dataset.filter;

  document.querySelector(".filter-dropdown-container p").textContent = `Filter by: ${currentFilter}`;

  console.log(currentFilter);
  buildList();
}

function filterList(allStudents) {
  const list = allStudents.filter((student) => student.house === currentFilter);
  if (currentFilter === "all") {
    return allStudents;
  } else {
    return list;
  }
}

function selectSort() {
  const clickedSort = this;
  const direction = this.dataset.sortDirection;
  setSort(clickedSort, direction);

  const clickedSortButton = this;
  changeSortDirection(clickedSortButton, direction);
}

function changeSortDirection(clickedSortButton, direction) {
  document.querySelectorAll(".sort-dropdown button").forEach((knap) => {
    knap.dataset.sortDirection = "asc";
  });

  document.querySelector(".sort-dropdown-container p").textContent = "";

  if (currentSort === "firstName") {
    document.querySelector(".sort-dropdown-container p").textContent = `Sort by: First Name`;
  } else if (currentSort === "lastName") {
    document.querySelector(".sort-dropdown-container p").textContent = `Sort by: Last Name`;
  } else {
    document.querySelector(".sort-dropdown-container p").textContent = `Sort by: ${currentSort}`;
  }

  if (direction === "asc") {
    clickedSortButton.dataset.sortDirection = "desc";
    document.querySelector(".sort-dropdown-container p").textContent += " 🔼";
  } else {
    clickedSortButton.dataset.sortDirection = "asc";
    document.querySelector(".sort-dropdown-container p").textContent += " 🔽";
  }
}

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

function sortList(currentList) {
  let sortedList;

  currentList.sort(sortByProperty);

  function sortByProperty(a, b) {
    console.log(currentSort);
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

function buildList() {
  const currentList = filterList(allStudents);
  sortList(currentList);
  displayList(currentList);
}

// Send each student object in the allStudents array to displayStudent function
function displayList(students) {
  document.querySelector("#all-students").innerHTML = "";
  students.forEach(displayStudent);

  document.querySelector(".students-gryffindor").textContent = "Students in Gryffindor: " + allStudents.filter((student) => student.house === "Gryffindor").length;
  document.querySelector(".students-hufflepuff").textContent = "Students in Hufflepuff: " + allStudents.filter((student) => student.house === "Hufflepuff").length;
  document.querySelector(".students-ravenclaw").textContent = "Students in Ravenclaw: " + allStudents.filter((student) => student.house === "Ravenclaw").length;
  document.querySelector(".students-slytherin").textContent = "Students in Slytherin: " + allStudents.filter((student) => student.house === "Slytherin").length;

  document.querySelector(".students-total").textContent = "Students in total: " + allStudents.length;
}

// Display each student
function displayStudent(student) {
  let studentContainer = document.querySelector("#all-students");
  let studentTemplate = document.querySelector("#student-template");

  let clone = studentTemplate.cloneNode(true).content;
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

  clone.querySelector("p").textContent = student.house;
  clone.querySelector("img").src = `images/${student.photo}`;
  clone.querySelector("img").alt = student.firstName;

  clone.querySelector(".student").addEventListener("click", () => {
    console.log(student);
  });
  studentContainer.appendChild(clone);
}
