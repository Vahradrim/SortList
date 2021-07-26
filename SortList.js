import React from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Components
import SortListItem from "./SortListItem";

export default function SortList(props)
{
  const scrollList = React.useRef(null);
  const [items, setItems] = React.useState(null);
  const [containerSize, setContainerSize] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [lastScrollPosition, setLastScrollPosition] = React.useState(0);
  const [lastShiftingItemIndex, setLastShiftingItemIndex] = React.useState(-1);
  const [alreadyHighlighted, setAlreadyHighlighted] = React.useState(true);
  const [isMoving, setIsMoving] = React.useState(false);

  const initItems = (data) =>
  {
    if(typeof(props.data) === 'undefined' || props.data === null || props.data.length <= 0)
      return [];
    const newItems = JSON.parse(JSON.stringify(data));
    return newItems.map((d, index) =>
    {
      return {
        id: index,
        initIndex: index,
        index: index,
        isShifting: false,
        data: {...d}
      };
    });
  };
  React.useEffect(() => { setItems(null); }, [props.data]);
  React.useEffect(() =>
  {
    if(items === null)
    {
      if(alreadyHighlighted === false)
        setAlreadyHighlighted(true);
      else if(alreadyHighlighted === true && lastShiftingItemIndex !== -1)
        setLastShiftingItemIndex(-1);
      setItems(initItems(props.data));
      if(typeof(scrollList.current) !== 'undefined' && scrollList.current !== null)
        scrollList.current.scrollTo(props.horizontal === true ? {x:lastScrollPosition, y:0, animated:true} : {x:0, y:lastScrollPosition, animated:true});
    }
  }, [items]);

  const getItem = (item, index) =>
  {
    return (
      <SortListItem
        horizontal={props.horizontal}
        edgingDelay={props.edgingDelay}
        edgeZonePercent={props.edgeZonePercent}
        key={index}
        id={item.id}
        initIndex={index}
        index={item.index}
        lastShiftingItemIndex={lastShiftingItemIndex}
        itemData={item.data}
        renderItem={props.renderItem}
        count={props.data.length}
        isShifting={item.isShifting}
        containerSize={containerSize}
        scrollPosition={scrollPosition}
        onMove={onMove}
        save={onSave}
      />
    );
  };

  const onSave = (id, itemSize) =>
  {
    if(isMoving === true)
      setIsMoving(false);
    const itemsWithoutCorrectIndexes = items.sort((x, y) => x.index - y.index);
    const shiftingItem = itemsWithoutCorrectIndexes.filter(x => x.id === id)[0];
    itemsWithoutCorrectIndexes.forEach((r,i) => { r.index = i; });
    const shiftingItemIndex = shiftingItem.index;
    const newItems = JSON.parse(JSON.stringify(itemsWithoutCorrectIndexes));
    const posToScrollTo = Math.max(0, (newItems.filter(x => x.id === id)[0].index * itemSize) - (containerSize / 2));
    setLastScrollPosition(posToScrollTo);
    setLastShiftingItemIndex(shiftingItemIndex);
    setAlreadyHighlighted(false);
    props.save(newItems.map(x => x.data));
  };

  const onMove = (id, draggablePosition, itemSize, isEdging, scrollPos) =>
  {
    if(isMoving === false)
      setIsMoving(true);
    const newItems = [...items];
    let shiftingItem = newItems.filter(x => x.id === id)[0];
    // Calculate shiftingItem new index
    let shiftingItemIndex = Math.trunc((draggablePosition + (itemSize / 2)) / itemSize);
    shiftingItemIndex = Math.max(0, shiftingItemIndex);
    shiftingItemIndex = Math.min(shiftingItemIndex, props.data.length - 1);
    // Shift all items up or down when the shifting item comes close to the edges of the container
    if(isEdging !== 0)
    {
      const minIndex = Math.min(...(newItems.filter(x => x.id !== id).map(x => x.index)));
      const maxShiftNext = Math.trunc(scrollPos / itemSize);
      const maxIndex = Math.max(...(newItems.filter(x => x.id !== id).map(x => x.index)));
      const maxShiftPrev = newItems.length - (Math.trunc(((newItems.length * itemSize) - (scrollPos  + containerSize)) / itemSize) + 1);
      if(isEdging < 0 && minIndex <= maxShiftNext)
        newItems.forEach(r => r.index++);
      else if(isEdging > 0 && maxIndex >= maxShiftPrev)
        newItems.forEach(r => r.index--);
    }
    // Index changed
    if(shiftingItemIndex !== shiftingItem.index)
    {
      let toSnap = [];
      if(shiftingItemIndex < shiftingItem.index)
      {
        toSnap = newItems.filter(x => x.id !== id && x.index < shiftingItem.index && shiftingItemIndex <= x.index);
        toSnap.forEach(x => { x.index = x.index + 1; });
      }
      else if(shiftingItemIndex > shiftingItem.index)
      {
        toSnap = newItems.filter(x => x.id !== id && x.index > shiftingItem.index && shiftingItemIndex >= x.index);
        toSnap.forEach(x => { x.index = x.index - 1; });
      }
    }
    // Apply changes
    shiftingItem.index = shiftingItemIndex;
    setItems(newItems);
    return newItems;
  };

  const getContent = () =>
  {
    return (
      items === null ?
        <View />
        :
        <View style={props.horizontal === true ? {height:"100%", flexDirection:'row'} : {width:"100%"}}>
          {items.map((item, index) => getItem(item, index))}
        </View>
    );
  };

  const onScroll = (e) =>
  {
    let scrollPos = props.horizontal === true ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y;
    if(scrollPos === 0 && lastScrollPosition !== 0)
    {
      scrollPos = lastScrollPosition;
      setLastScrollPosition(0);
      scrollList.current.scrollTo(
      props.horizontal === true ? {x:scrollPos, y:0, animated:true} : {x:0, y:scrollPos, animated:true});
    }
    else if(scrollPos !== 0 && lastScrollPosition !== 0)
    {
      setLastScrollPosition(0);
    }
    setLastScrollPosition(scrollPos);
    setScrollPosition(scrollPos);
  };

  return (
    <View
      style={[props.horizontal === true ? {height:"100%"} : {width:"100%"}, props.style]}
      onLayout={(event) => setContainerSize(props.horizontal === true ? event.nativeEvent.layout.width : event.nativeEvent.layout.height)}
    >
      <View style={[
        {position:'absolute', zIndex:2},
        props.horizontal === true ?
          {left:0, height:"100%", width:(isMoving === true ? (containerSize * props.edgeZonePercent / 100) : 0)} :
          {top:0, width:"100%", height:(isMoving === true ? (containerSize * props.edgeZonePercent / 100) : 0)}
      ]}>
        <LinearGradient style={{height:"100%", width:"100%"}}
          start={[0, 0]}
          end={props.horizontal === true ? [1, 0] : [0, 1]}
          colors={[props.edgeColor, props.edgeColor, "transparent"]}
        />
      </View>
      {containerSize === 0 ? <View/> :
        <ScrollView
          ref={scrollList}
          horizontal={props.horizontal}
          style={{zIndex:1}, props.horizontal === true ? {height:"100%"} : {width:"100%"}}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
        >
          {getContent()}
        </ScrollView>
      }
      <View style={[
        {position:'absolute', zIndex:2},
        props.horizontal === true ?
          {right:0, height:"100%", width:(isMoving === true ? (containerSize * props.edgeZonePercent / 100) : 0)} :
          {bottom:0, width:"100%", height:(isMoving === true ? (containerSize * props.edgeZonePercent / 100) : 0)}
      ]}>
        <LinearGradient style={{height:"100%", width:"100%"}}
          start={[0, 0]}
          end={props.horizontal === true ? [1, 0] : [0, 1]}
          colors={["transparent", props.edgeColor, props.edgeColor]}
        />
      </View>
    </View>
  );
}

