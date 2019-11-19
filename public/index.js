/*
 * This file doesn't contain any JS because this assignment is released before
 * the due date of the previous assignment, so I don't want to give you the
 * solution to that assignment yet ;)  You'll know this file was served
 * correctly if you see the alert below in your browser.  Alternatively, you
 * can add your own solution code from the previous assignment here in order
 * to see all of the client-side JS interactions you implemented.
 */

// Item Class
function Item(item) {
  this.node           = item;
  this.price          = item.dataset.price;
  this.city           = item.dataset.city;
  this.condition      = item.dataset.condition;
  this.title          = item.querySelector('.post-title').textContent;
  this.parent         = item.parentNode;
  this.display        = true;
  this.removedFromDOM = false;
}

Item.prototype.printData = function () {
  console.log(  'Title: ' + this.title + '; ' + 'Price: ' + this.price + '; '
              + 'City: ' + this.city + '; ' + 'Condition: ' + this.condition + '; '
              + 'Display: ' + this.display + '; '
              + 'removedFromDOM: ' + this.removedFromDOM + '; ');
};



// Comparison Functions
function titleCompare(item, title) {
  return title == 'any'
                  || item.title.toLowerCase().includes(title.toLowerCase());
}

/* Returns true if the item's price is between the values in the price parameter
   which has syntax "a,b" for min price a and max price b. */
function priceCompare(item, price) {
  var splitString = price.split(',');
  return price == 'any' || (splitString.length == 2
                               && ((splitString[0] == ''
                                    && item.price <= parseInt(splitString[1]))
                                || (splitString[1] == ''
                                    && item.price >= parseInt(splitString[0]))
                                || (item.price >= parseInt(splitString[0])
                                    && item.price <= parseInt(splitString[1]))
                                  )
                           );
}

function cityCompare(item, city) {
  return city == 'any' || item.city.toLowerCase() == city.toLowerCase();
}

/* Returns true if the item's condition is one of values in the condition param-
   eter which has syntax "a,b,c," for possible conditions a,b, and c */
function conditionCompare(item, condition) {
  var splitString = condition.split(',');
  var conditionTrue = false;
  splitString.forEach((c) => {
       if(item.condition.toLowerCase() == c.toLowerCase()) {
         conditionTrue = true;
       }
     });

  return condition == 'any' || conditionTrue;
}



// Helper Functions
// sets if item should be displayed if it has the target attribute
function displayItemIf(item, comparisonFunction, targetValue) {
  // console.log('Comparing ', item, ' and ', comparisonFunction, ' ', targetValue,
  //             'is ', comparisonFunction(item, targetValue));
  item.display = comparisonFunction(item, targetValue);
}


// sets if item should be displayed if it does not have the target attribute
function displayItemIfNot(item, comparisonFunction, targetValue) {
  item.display = !comparisonFunction(item, targetValue);
}


// sets all items in items to be displayed
function displayAllItems(items) {
  items.forEach((item) => {
    item.display = true;
  });
}

// removes or repopulates items from dom if they are marked as such
function updateDOM(items) {
  items.forEach((item, index) => {
    if (item.display == false && item.removedFromDOM == false) {
      item.parent.removeChild(item.node);
      item.removedFromDOM = true;
    } else if (item.display == true && item.removedFromDOM == true) {
      if(index > 0) {
        item.parent.insertBefore(item.node, items[index-1].node.nextSibling);
      } else {
        item.parent.prepend(item.node);
      }
      item.removedFromDOM = false;
    }
  });
}



// Variables
var items = [];
document.querySelectorAll('.post').forEach((item) => {
  items.push(new Item(item));
});
var postSection =     document.querySelector('#posts');

var filters = {
  title:      '',
  priceRange: '',
  city:       '',
  conditions: ''
};

var filterElements = {
  title:      document.querySelector('#filter-text'),
  priceMin:   document.querySelector('#filter-min-price'),
  priceMax:   document.querySelector('#filter-max-price'),
  city:       document.querySelector('#filter-city'),
  conditions: document.querySelectorAll('input[name=filter-condition]')
};



// Main Functions
// Sets the filter values based on the input things
function setFilters() {
  filters.title = filterElements.title.value;
  if (filters.title == '') {
    filters.title = 'any';
  }

  filters.priceRange = filterElements.priceMin.value
                       + ',' + filterElements.priceMax.value;
  if (filters.priceRange == ',') {
    filters.priceRange = 'any';
  }

  if(filterElements.city.item(filterElements.city.selectedIndex).value != '') {
    filters.city = filterElements.city.item(filterElements.city.selectedIndex).value;
  } else {
    filters.city = 'any';
  }

  filters.conditions = '';
  filterElements.conditions.forEach((checkbox) => {
    if(checkbox.checked == true) {
      filters.conditions += checkbox.value + ',';
    }
  });
  if(filters.conditions == '') {
    filters.conditions = 'any';
  }
}


// Prints the values of the filters
function printFilters() {
  console.log('\n\nFilters:\n')
  console.log('Title = ', filters.title);
  console.log('Price Range = ', filters.priceRange);
  console.log('City = ', filters.city);
  console.log('Conditions = ', filters.conditions);
}


// Update the present posts based on filters
function updateFilters() {
  setFilters();
  printFilters();

  displayAllItems(items);

  items.forEach((item) => {
    if (item.display == true) {
      displayItemIf(item, titleCompare, filters.title);
    }
    if (item.display == true) {
      displayItemIf(item, priceCompare, filters.priceRange);
    }
    if (item.display == true) {
      displayItemIf(item, cityCompare, filters.city);
    }
    if (item.display == true) {
      displayItemIf(item, conditionCompare, filters.conditions);
    }
  });

  updateDOM(items);

  // items.forEach((item) => {if(item.display) {item.printData();}});
}




// Modal Stuff
// Variables
var modalHidden = true;
var hiddenElements = document.getElementsByClassName('hidden');
var modalInputElements = document.querySelectorAll('.post-input-element');


// Functions
function clearModalInputs() {
  modalInputElements.forEach((item) => {
    if(item.querySelector('fieldset') == undefined) {
      item.querySelector('input').value = '';
    } else {
      item.querySelector('input').checked = true;
    }
  });
}

function openModal() {
  for(var i = 0; i < hiddenElements.length; i++) {
    hiddenElements[i].style.display = 'inline';
  }
}

function closeModal() {
  for(var i = 0; i < hiddenElements.length; i++) {
    hiddenElements[i].style.display = 'none';
  }
  clearModalInputs();
}

// returns true if the fields are ready to be used
function checkFields() {
  var incomplete = '';

  modalInputElements.forEach((item) => {
    if (item.querySelector('fieldset') == undefined
          && item.querySelector('input').value == '') {
      incomplete += '\"' + item.querySelector('label').textContent + '\", ';
    }
  });

  console.log(incomplete);

  if (incomplete != '') {
    alert('Please complete the ' + incomplete + 'field(s) before submitting!');
    return false;
  } else {
    return true;
  }
}

function createPost(price, condition, city, photoURL, description) {
  var newPost = document.createElement('div');
  newPost.className = "post";
  newPost.dataset.price = price;
  newPost.dataset.city = city;
  newPost.dataset.condition = condition;
  postSection.appendChild(newPost);

  var newContents = document.createElement('div');
  newContents.className = 'post-contents';
  newPost.appendChild(newContents);

  var newImageContainer = document.createElement('div');
  newImageContainer.className = 'post-image-container';
  newContents.appendChild(newImageContainer);

  var newImage = document.createElement('img');
  newImage.src = photoURL;
  newImage.alt = description;
  newImageContainer.appendChild(newImage);

  var newInfoContainer = document.createElement('div');
  newInfoContainer.className = 'post-info-container';
  newContents.appendChild(newInfoContainer);

  var newTitle = document.createElement('a');
  newTitle.href = '#';
  newTitle.className = 'post-title';
  newTitle.appendChild(document.createTextNode(description));
  newInfoContainer.appendChild(newTitle);

  var newPriceSpan = document.createElement('span');
  newPriceSpan.className = 'post-price';
  newPriceSpan.appendChild(document.createTextNode('$' + price));
  newInfoContainer.appendChild(newPriceSpan);

  var newCitySpan = document.createElement('span');
  newCitySpan.className = 'post-city';
  newCitySpan.appendChild(document.createTextNode('\(' + city + '\)'));
  newInfoContainer.appendChild(newCitySpan);

  items.push(new Item(newPost));
}

function addNewCity(city) {
  var newCity = true;

  document.querySelectorAll('#filter-city option').forEach((item) => {
    if(item.textContent == city) {
      newCity = false;
    }
  });

  if (newCity) {
    var newOption = document.createElement('option');
    newOption.appendChild(document.createTextNode(city));
    document.querySelector('#filter-city').appendChild(newOption);
  }
}

function applyModal() {
  if(checkFields()) {
    var condition = 'New';
    document.querySelector('#post-condition-fieldset'
          ).querySelectorAll('input').forEach((option) => {
            if(option.checked) {
              condition = option.parentNode.querySelector('label').textContent;
            }
          });

    createPost(document.querySelector('#post-price-input').value,
               condition,
               document.querySelector('#post-city-input').value,
               document.querySelector('#post-photo-input').value,
               document.querySelector('#post-text-input').value);

    addNewCity(document.querySelector('#post-city-input').value);
    updateFilters();
    closeModal();
  }
}


// Update on load
updateFilters();

// Set update button onclick
document.getElementById('filter-update-button').onclick = updateFilters;

// Set update on enter presss for fields
var updateElements = document.querySelectorAll(
        '.filter-input-element, .filter-input-container, input[name=filter-condition], .filter-input-container');
updateElements.forEach((element) => {
  element.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("filter-update-button").click();
    }
  });
});

// Click events for modal
var closeElements = document.querySelectorAll('#modal-close, #modal-cancel');
var openElements  = document.querySelectorAll('#sell-something-button');
var applyElements = document.querySelectorAll('#modal-accept');
var modalBG = document.querySelector('#sell-something-modal');
var modalFG = document.querySelector('.modal-dialog');
closeElements.forEach((element) => { element.onclick = closeModal; });
openElements.forEach((element) => { element.onclick = openModal; });
applyElements.forEach((element) => { element.onclick = applyModal; });
modalFG.addEventListener("click", (ev) => { ev.stopPropagation(); }, false);
modalBG.addEventListener("click", () => { closeModal(); }, false);
