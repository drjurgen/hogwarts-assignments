"use strict";

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];
const Student = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  gender: "",
  house: "",
  photo: "",
};

function start() {
  console.log("ready");
  loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
}

async function loadJSON(url, callback) {
  const response = await fetch(url);
  const data = await response.json();
  callback(data);
}

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
  showStudents();
}

function showStudents() {
  let studentContainer = document.querySelector("#all-students");
  let studentTemplate = document.querySelector("#student-template");

  allStudents.forEach((student) => {
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
  });
}
