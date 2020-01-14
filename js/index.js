let onEdit = false;

const Render = {
  render: (template, elemt) => {
    const result = elemt.innerHTML = template
    return result
  }
}

const sortable = () => {
  $( "#sortable" ).sortable();
  $( "#sortable" ).disableSelection();
};

const toggleClass = () => {
  const modal = document.querySelector('.modal')
  const trueOrFalse = modal.classList.contains('show')
  return trueOrFalse ? modal.classList.remove('show') : modal.classList.add('show')
}

const template = listCopy => {
  const partme = listCopy.map(item =>
    `<li>${item.name}
      <img src='${item.img}'/>
      <a onclick='deleteItem(${item.id})'>
        <span>Delete</span>
      </a>
      <a onclick='editItem(${JSON.stringify(item)})'>Edit</a>
    </li>`
  ).join("");
  const templateString = (
    `<div class='wrapper'>
      <button onclick='toggleClass()'>add Items +</button>
      <ul id="sortable">
        ${partme}
      </ul>
    </div>`
  )
  return Render.render(templateString, document.getElementById('app'))
}

const getMovies = () => new Promise((resolve, reject) => {
  fetch("https://stentrial.firebaseio.com/movies.json")
  .then(data => data.json())
  .then(resolve)
})

const getItems = () => new Promise(resolve => {
  if (window.localStorage.getItem('list')) {
    return resolve(JSON.parse(window.localStorage.getItem('list')))
  }
  getMovies().then(data => {
    window.localStorage.setItem("list", JSON.stringify(data))
    resolve(data)
  })
})

const init = () => getItems().then(list => {
  template(list);
  sortable();
})

const addItem = value => {
  // if (value === '') return false
  toggleClass()
  const item = { id: Date.now(), ...value }
  addItemApi(item).then(list => setTimeout(() => {
    template(list);
    sortable();
  }, 1000))
}

const addItemApi = value => new Promise(resolve => getItems().then(list => {
  window.localStorage.setItem('list', JSON.stringify([...list, value]))
  resolve([...list, value])
}))

const deleteItem = id => deleteItemApi(id).then(list => setTimeout(() => {
  template(list);
  sortable();
}, 600))

const deleteItemApi = id => new Promise(resolve => {
  getItems()
    .then(items => {
      const remove = items.filter(item => item.id !== id)
      window.localStorage.setItem('list', JSON.stringify(remove))
      resolve(remove)
    })
})

const updateItem = editedItem => console.log({editedItem}) ||
  getItems()
    .then(list => {
      console.log({list})
      list = list.map(item => item.id !== editedItem.id ? item : ({id: item.id, ...editedItem}))

      window.localStorage.setItem('list', JSON.stringify(list))
      template(list);
      sortable();
      onEdit = false;
    })


const editItem = item  => {
  console.log(item)
  toggleClass();
  document.getElementById("name").value = item.name
  document.getElementById("description").value = item.description
  document.getElementById("id").value = item.id
  document.getElementById("img").src = item.img
  onEdit = true;
}

function previewFile() {
  const preview = document.querySelector('img');
  const file = document.querySelector('input[type=file]').files[0];
  const reader = new FileReader();

  function getImageDimensions(file) {
  return new Promise (function (resolved, rejected) {
    var i = new Image()
    i.onload = function(){
      resolved({width: i.width, height: i.height})
    };
    i.src = file
  })
}

  reader.addEventListener("load", async () => {
    // convert image file to base64 string
    const {width, height} = await getImageDimensions(reader.result);
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

function submit_by_id() {
  var name = document.getElementById("name").value;
  var description = document.getElementById("description").value;
  var img = document.getElementById("img").src;
  var id = document.getElementById("id").value
  // document.getElementById("form_id").submit(); //form submission
  if (onEdit) {
    console.log(id, name)
    updateItem({id, name, description, img})
  } else {
    addItem({name, description, img})
  }
  document.getElementById("img").src = '';
  document.getElementById("form").reset();

}


init();