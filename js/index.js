
let onEdit = false;

const Render = {
  render: (template, elemt) => {
    const result = elemt.innerHTML = template
    return result
  }
}

// This function activates the Drag&Drop funtion
const sortable = () => {
  $( "#sortable" ).sortable();
  $( "#sortable" ).disableSelection();
};

// Open/close modal and cleans form
const toggleClass = () => {
  const modal = document.querySelector('.modal')
  const trueOrFalse = modal.classList.contains('show')
  document.getElementById("img").src = 'img/placeholder.png';
  document.getElementById("form").reset();
  return trueOrFalse ? modal.classList.remove('show') : modal.classList.add('show')
}

// Prints the list in html
const template = listCopy => {
  const partme = listCopy.map(item =>
      `<li>
    <img src='${item.img}' class='card-img'/>
    <h3>${item.name}</h3>
    <p class='description'>${item.description}</p>
    <div class='btn-box'>
    <a onclick='editItem(${JSON.stringify(item)})' class='edit'>
    Edit
    </a>
    <a onclick='deleteItem(${item.id})' class='delete'>
      Delete
    </a>
    </div>
  </li>`
  ).join("");
  const templateString = (
    `<div class='wrapper'>
    <div class='header'>
      <button onclick='toggleClass()' class='btn-add'>Add item</button>
      <p id="counter">
        Movie counter: ${listCopy.length}
      </p>
    </div>
    <ul id="sortable">
      ${partme}
    </ul>
  </div>`
  )
  return Render.render(templateString, document.getElementById('app'))
}

// Gets the json from firebase
const getMovies = () => new Promise((resolve, reject) => {
  fetch("https://stentrial.firebaseio.com/movies.json")
  .then(data => data.json())
  .then(resolve)
})

// When loading the page, checks if there is local storage info and if not, bring the data from firebase
const getItems = () => new Promise(resolve => {
  if (window.localStorage.getItem('list')) {
    return resolve(JSON.parse(window.localStorage.getItem('list')))
  }
  getMovies().then(data => {
    window.localStorage.setItem("list", JSON.stringify(data))
    resolve(data)
  })
})

// loads the list
const init = () => getItems().then(list => {
  template(list);
  sortable();
})

// Assigns a unique id to the new item, calls the next funtion that adds the new item to the list, and then prints the list
const addItem = value => {
  const item = { id: Date.now(), ...value }
  addItemApi(item).then(list => setTimeout(() => {
    template(list);
    sortable();
  }, 1000))
}

// Adds the new item to the list
const addItemApi = value => new Promise(resolve => getItems().then(list => {
  window.localStorage.setItem('list', JSON.stringify([...list, value]))
  resolve([...list, value])
}))

// Calls the funtion to delete the item & prints the new list
const deleteItem = id => deleteItemApi(id).then(list => setTimeout(() => {
  template(list);
  sortable();
}, 600))

// deletes the item
const deleteItemApi = id => new Promise(resolve => {
  getItems()
    .then(items => {
      const remove = items.filter(item => item.id !== id)
      window.localStorage.setItem('list', JSON.stringify(remove))
      resolve(remove)
    })
})

// Updates the information in the item and prints the new list
const updateItem = editedItem =>  getItems()
  .then(list => {
    list = list.map(item => item.id !== editedItem.id ? item : ({ id: item.id, ...editedItem }))
    window.localStorage.setItem('list', JSON.stringify(list))
    template(list);
    sortable();
    onEdit = false;
  })

// Gathers the new information of the edited item
const editItem = item => {
  toggleClass();
  document.getElementById("name").value = item.name
  document.getElementById("description").value = item.description
  document.getElementById("id").value = item.id
  document.getElementById("img").src = item.img
  onEdit = true;
}

// Loads the new image in the placeholder and alert us if it is too big.
const previewFile = () => {
  const preview = document.getElementById('img');
  const file = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();

  const getImageDimensions = file => {
    return new Promise (function (resolved, rejected) {
      var i = new Image()
      i.onload = function(){
        resolved({width: i.width, height: i.height})
      };
      i.src = file
    })
  }

  reader.addEventListener("load", async() => {
    // convert image file to base64 string
    const { width, height } = await getImageDimensions(reader.result);
    if (height > 320 || width > 320) {
      alert("Height and Width must not exceed 320px.");
      return false;
    }
    preview.src = reader.result;
  }, false);

  if (file) {
      reader.readAsDataURL(file);
  }
}

// Saves the new or edited item
const save = () => {
  var name = document.getElementById("name").value;
  var description = document.getElementById("description").value;
  var img = document.getElementById("img").src;
  var id = Number(document.getElementById("id").value);
  if (document.getElementById("name").value === '' || document.getElementById("description").value === '' || document.getElementById("img").src === 'img/placeholder.png') {
    alert("Required fields are empty");
    return false;
  }
  if (onEdit) {
    updateItem({ id, name, description, img })
  } else {
    addItem({ name, description, img })
  }
  toggleClass();
}

init();
