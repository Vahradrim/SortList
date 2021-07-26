import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// Components
import SortList from "./SortList";

export default function SortListHorizontalExample(props)
{
  // Your list, the elements can take any type of form, there's no limitations nor required fields
  const data = [
    {id:1, isChecked: false},
    {id:2, isChecked: false},
    {id:3, isChecked: false},
    {id:4, isChecked: false},
    {id:5, isChecked: false},
    {id:6, isChecked: false},
    {id:7, isChecked: false},
    {id:8, isChecked: false},
    {id:9, isChecked: false},
    {id:10, isChecked: false},
    {id:11, isChecked: false},
    {id:12, isChecked: false},
    {id:13, isChecked: false},
  ];
  const [items, setItems] = React.useState(data);

  // The action performed when the checkbox of an element is clicked
  const selectItem = (id) =>
  {
    const selectedItem = items.filter(x => x.id === id)[0];
    selectedItem.isChecked = !selectedItem.isChecked;
    setItems([...items]);
  }

  // Here you can render any type of view and complex elements
  // Keep in mind that it's a list, the complexity will build up along with the length of the list: keep it simple
  // Note : make sure the component holding the '{...handler}' props is the last component rendered
  // Otherwise the scrollview gestures will take over and you won't be able to move items 
  const renderItem = (handler, id, itemData) =>
  {
    return (
      <View key={itemData.id} style={s.container}>
        <View style={s.index}>
          <Text style={{fontSize: 14, color:"rgba(100,100,100,1)"}}>
            {itemData.id + 1}
          </Text>
        </View>
        <View style={s.selectButton}>
          <MaterialCommunityIcons
            name={itemData.isChecked === false ? "checkbox-blank-circle-outline" : "check-circle-outline"}
            size={25}
            color={itemData.isChecked === false ? "rgba(200,200,200,0.5)" : "rgba(0,200,0,1)"}
          />
          <TouchableOpacity style={{ ...StyleSheet.absoluteFill }} activeOpacity={0.5} onPress={() => selectItem(itemData.id)}>
            <View style={{ ...StyleSheet.absoluteFill }}/>
          </TouchableOpacity>
        </View>
        <View style={s.orderButton} {...handler}>
          <MaterialCommunityIcons
            name={"drag-horizontal-variant"}
            size={25}
            color={"rgba(0,140,230,1)"}
          />
        </View>
      </View>
    );
  };

  // The list can be in any type of container
  return (
    <View style={{height:"100%", width:"100%"}}>
      <SortList
        horizontal={true}                           // The orientation of the list
        data={items}                                // The list of items to render
        renderItem={renderItem}                     // The function to render each item
        save={setItems}                             // The function called when an event happens in the list
        edgingDelay={350}                           // Delay to wait before scrolling the list when an item is on an edge
        edgeZonePercent={10}                        // The size of the edge zone (to scroll the list up or down)
        edgeColor={"rgba(0,140,230,0.3)"}           // The color of the edge zone (can be transparent if needed)
        style={s.list}
        contentContainerStyle={s.contentContainer}
      />
    </View>
  );
}

let s = StyleSheet.create(
{
  list:
  {
    width:"100%",
    flex:1,
    backgroundColor: "rgba(250,250,250,1)",
    justifyContent:'center',
    alignItems:'center',
    overflow:'hidden',
  },
  contentContainer:
  {
    width:"100%",
  },
  container:
  {
    height:"94%",
    aspectRatio:0.1,
    marginRight:10,
    borderRadius:100,
    borderWidth:1,
    borderColor: "rgba(0,140,230,1)",
    backgroundColor: "rgba(250,250,250,1)",
    justifyContent:'space-evenly',
    alignItems:'center',
    overflow:'hidden',
  },
  index:
  {
    width:"100%",
    aspectRatio:0.5,
    marginLeft:10,
    justifyContent:'center',
    alignItems:'center',
    overflow:'hidden',
  },
  selectButton:
  {
    width:"100%",
    aspectRatio:0.5,
    justifyContent:'center',
    alignItems:'center',
    overflow:'hidden',
  },
  orderButton:
  {
    width:"100%",
    aspectRatio:0.5,
    marginHorizontal:10,
    justifyContent:'center',
    alignItems:'center',
    overflow:'hidden',
  },
});

