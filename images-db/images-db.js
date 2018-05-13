const fsPromises = require('fs/promises');

class imageDB {
  constructor(objectData = {}) {
    this.loadData(objectData);
  }

  loadData(objectData) {
    this.objectData = objectData;
  }

  load(objectData) {
    this.loadData(objectData);
  }

  async save(fileName) {
    try {
      await fsPromises.writeFile(fileName, JSON.stringify(this.objectData))

      // success case, the file was saved
      console.log('DB saved!');
    } catch(err) {
      throw err;
    }
  }

  get() {
    return this.objectData
  }

  add({data, key, title}) {
    if (!key) {
      // console.log(key)
      throw Error('Add need a key');
    }
    // Add new data
    if (!this.objectData.data) {
      this.objectData.data = {}
    }
    if (!this.objectData.ids) {
      this.objectData.ids = []
    }

    this.objectData.ids.push(key)
    this.objectData.data[key] = { ...this.objectData.data[key], ...data }
    if (title) {
      this.addTitle({key, title})
    }
  }

  edit({data, key, title = null}) {
    if (!key && !title) {
      throw Error('Edit need a key or a title.');
    }

    let _key = 0

    if (!key) {
      try {
        _key = this.objectData.titleToId[title]
      } catch(err) {
        throw Error('Title not found.');
      }
    } else {
      _key = key
    }

    const previousTitle = this.objectData.data[_key].title || null

    if (
      !previousTitle ||
      previousTitle != title
    ) {
      // Delete previous title
      this.deleteTitle(title)
      // Edit/Add new title
      this.addTitle({key: _key, title})
    }

    this.objectData.data[_key] = { ...this.objectData.data[_key], ...data }
  }

  delete({key, title}) {
    if (this.objectData.ids) {
      this.objectData.ids = this.objectData.ids.filter(e => e != key)
    }
    delete this.objectData.data[key]
    this.deleteTitle(title)
  }

  addTitle({key, title}) {
    if (!this.objectData.titles) {
      this.objectData.titles = []
    }
    if (!this.objectData.titleToId) {
      this.objectData.titleToId = {}
    }
    this.objectData.data[key].title = title
    this.objectData.titles.push(title)
    this.objectData.titleToId[title] = key
  }

  deleteTitle(title) {
    this.objectData.titles = this.objectData.titles.filter(e => e != title)
    delete this.objectData.titleToId[title]
  }

}

module.exports = imageDB;
