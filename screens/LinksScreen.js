import React from 'react';
import { ScrollView, StyleSheet, Text, FlatList, View, TouchableWithoutFeedback } from 'react-native';
import * as firebaseApp from 'firebase';
import config from './../config';
import {
  TextInput,
  Button,
  Snackbar,
  Portal,
  Dialog,
  Paragraph,
  Provider as PaperProvider
} from "react-native-paper";

import { Ionicons } from "@expo/vector-icons";

export default class LinksScreen extends React.Component {
  constructor(props) {
    super(props);

    if (!firebaseApp.apps.length) {
      firebaseApp.initializeApp(config);
    }
    this.citiesRef = firebaseApp.database().ref('items');
    const dataSource = [];
    this.state = {
      dataSource: dataSource,
      selecteditem: null,
      snackbarVisible: false,
      confirmVisible: false,
      loading: true
    };
  }

  componentWillMount() {
    this.listenForCities(this.citiesRef)
  }

  // GET
  listenForCities(citiesRef) {
    citiesRef.on("value", dataSnapshot => {
      var cities = [];
      dataSnapshot.forEach(child => {
        cities.push({
          name: child.val().name,
          mail: child.val().mail,
          key: child.key
        });
      });
      console.log("***Cities", cities)

      this.setState({
        dataSource: cities,
        loading: false
      });
    });
  }

  // POST
  addItem(itemName, itemMail) {
    var newPostKey = firebaseApp
      .database()
      .ref()
      .child("items")
      .push().key;


    var updates = {};
    updates["/items/" + newPostKey] = {
      name:
        itemName === "" || itemName == undefined
          ? this.state.itemname
          : itemName,
      mail:
        itemMail === "" || itemMail == undefined
          ? this.state.itemmail
          : itemMail,

    };

    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  // PUT
  updateItem() {

    var updates = {};
    updates["/items/" + this.state.selecteditem.key] = {
      name: this.state.itemname,
      mail: this.state.itemmail
    };

    console.log("ACTION UPDATE ****", updates);

    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  saveItem() {
    if (this.state.selecteditem === null) this.addItem(this.state.itemname, this.state.itemmail);
    else this.updateItem();

    this.setState({ itemname: "", itemmail: "", selecteditem: null });
  }

  // DELETE
  deleteItem(item) {
    this.setState({ deleteItem: item, confirmVisible: true });
  }

  performDeleteItem(key) {
    var updates = {};
    updates["/items/" + key] = null;
    return firebaseApp
      .database()
      .ref()
      .update(updates);
  }

  hideDialog(yesNo) {
    this.setState({ confirmVisible: false });
    if (yesNo === true) {
      this.performDeleteItem(this.state.deleteItem.key).then(() => {
        this.setState({ snackbarVisible: true });
      });
    }
  }

  showDialog() {
    this.setState({ confirmVisible: true });
    console.log("in show dialog");
  }

  undoDeleteItem() {
    this.addItem(this.state.deleteItem.name);
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          width: "90%",
          height: 2,
          backgroundColor: "#BBB5B3"
        }}
      >
        <View />
      </View>
    );
  };

  render() {
    if (this.state.loading == true) {
      return (
        <Text>
          Chargement...
       </Text>
      )
    }
    return (

      <PaperProvider>
        <View style={styles.container}>
          <ScrollView style={styles.container}>
            {/**
       * Go ahead and delete ExpoLinksView and replace it with your content;
       * we just wanted to provide you with some helpful links.
       */}
            <Text>City list from firebase</Text>
            <TextInput
              label="name"
              style={{
                height: 50,
                width: 250,
                borderColor: "gray",
                borderWidth: 1
              }}
              onChangeText={text => this.setState({ itemname: text })}
              value={this.state.itemname}
            />
            <TextInput
              label="email"
              style={{
                height: 50,
                width: 250,
                borderColor: "gray",
                borderWidth: 1
              }}
              onChangeText={text => this.setState({ itemmail: text })}
              value={this.state.itemmail}
            />
            <View style={{ height: 10 }}></View>
            <Button
              mode="contained"
              icon={this.state.selecteditem === null ? "add" : "update"}
              onPress={() => this.saveItem()}
            >
              {this.state.selecteditem === null ? "add" : "update"}
            </Button>
            <FlatList
              data={this.state.dataSource}
              renderItem={({ item }) => (
                <View>
                  <ScrollView horizontal={true}>
                    <TouchableWithoutFeedback>
                      <View style={{ paddingTop: 10 }}>
                        <Text
                          style={{ color: "#4B0082" }}
                          onPress={() => this.deleteItem(item)}
                        >
                          <Ionicons name="md-trash" size={20} />
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback
                      onPress={() =>
                        this.setState({
                          selecteditem: item,
                          itemname: item.name,
                          itemmail: item.mail,
                        })
                      }
                    >
                      <View>
                        <Text style={styles.item}> {item.name} {item.mail}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  </ScrollView>
                </View>
              )}
              ItemSeparatorComponent={this.renderSeparator}
            />
            <Portal>
              <Dialog
                visible={this.state.confirmVisible}
                onDismiss={() => this.hideDialog(false)}
              >
                <Dialog.Title>Confirm</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>Are you sure you want to delete this?</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => this.hideDialog(true)}>Yes</Button>
                  <Button onPress={() => this.hideDialog(false)}>No</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </ScrollView>

          <Snackbar
            visible={this.state.snackbarVisible}
            onDismiss={() => this.setState({ snackbarVisible: false })}
            action={{
              label: "Undo",
              onPress: () => {
                // Do something
                this.undoDeleteItem();
              }
            }}
          >
            Item deleted successfully.
          </Snackbar>
        </View>
      </PaperProvider>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
