import React, { Component } from 'react';
import { StyleSheet, PanResponder, Animated } from 'react-native';

export default class SortListItem extends Component
{
  constructor(props)
  {
    super(props);
    let position = new Animated.ValueXY();
    const panResponder = PanResponder.create(
    {
        onStartShouldSetPanResponder: () => true,

        onPanResponderGrant: (evt, gestureState) =>
        {
          let offset = props.horizontal === true ? {x:position.__getValue().x, y:0} : {x:0, y:position.__getValue().y};
          position.setOffset(offset);
          this.setState({ ...this.state, offset:offset, isMoving: true });
          position.setValue({x:0,y:0});
        },

        onPanResponderMove: (event, gesture) =>
        {
          let movement = props.horizontal === true ? gesture.dx : gesture.dy;
          let maxPos = props.count * this.state.itemSize;
          let offset = props.horizontal === true ? this.state.offset.x : this.state.offset.y;
          let finalPos = movement + offset + (this.state.itemSize * props.initIndex);
          if(finalPos < 0)
            movement = -(offset + (this.state.itemSize * props.initIndex));
          else if(finalPos > (maxPos - this.state.itemSize))
            movement = maxPos - offset - (this.state.itemSize * (props.initIndex + 1));
          
          let pos = props.horizontal === true ? {x:movement, y:0} : {x:0, y:movement};
          position.setValue(pos);
          props.onMove(props.id, finalPos, this.state.itemSize, this.isEdging(finalPos), this.props.scrollPosition);
        },

        onPanResponderRelease: (evt, gesture) =>
        {
          const lastPos = (this.state.index - props.initIndex) * this.state.itemSize;
          position.setOffset(props.horizontal === true ? {x:lastPos, y:0} : {x:0, y:lastPos});
          position.setValue({x:0,y:0});
          this.setState({ ...this.state, isMoving: false });
          this.props.save(props.id, this.state.itemSize);
        }
    });

    this.state =
    {
      panResponder,
      position,
      itemSize: 0,
      offset: 0,
      index: props.index,
      isMoving: false,
      lastEdgingTime: new Date(),
    };
  }

  isEdging(position)
  {
    // Inside the 'scrolling zone' ?
    const now = new Date();
    if(
      (now - this.state.lastEdgingTime) > this.props.edgingDelay &&
      position < (this.props.scrollPosition + (this.props.containerSize * this.props.edgeZonePercent / 100))
    )
    {
      this.setState({...this.state, lastEdgingTime: now});
      return -1;
    }
    else if(
      (now - this.state.lastEdgingTime) > this.props.edgingDelay &&
      position > ((this.props.scrollPosition + this.props.containerSize) - (this.props.containerSize * this.props.edgeZonePercent / 50))
    )
    {
      this.setState({...this.state, lastEdgingTime: now});
      return 1;
    }
    return 0;
  }

  snapToIndex(index, highlight)
  {
    this.state.position.stopAnimation();
    const currentPos = this.props.horizontal === true ?
      {x:this.state.position.__getValue().x, y:0} :
      {x:0, y:this.state.position.__getValue().y};
    const nullPos = {x:0,y:0};
    const newPos = this.props.horizontal === true ?
      {x:((this.state.itemSize * index) - (this.state.itemSize * this.props.initIndex)), y:0} :
      {x:0, y:((this.state.itemSize * index) - (this.state.itemSize * this.props.initIndex))};
    this.state.position.setOffset(nullPos);
    this.state.position.setValue(currentPos);
    Animated.timing(this.state.position, { toValue:newPos, duration: 300, }).start(() =>
    {
      this.state.position.setOffset(newPos);
      this.state.position.setValue(nullPos);
      if(highlight === true)
      {
        Animated.timing(this.state.position, { toValue:(this.props.horizontal === true ? {x:0,y:25} : {x:25,y:0}), duration: 150, }).start(() =>
        {
          Animated.timing(this.state.position, { toValue:nullPos, duration: 150, }).start();
        });
      }
    });
  }

  componentDidMount()
  {
    this.snapToIndex(this.props.index, this.props.id === this.props.lastShiftingItemIndex);
  }

  componentDidUpdate(prevProps, prevState)
  {
    if (this.state.isMoving === false && (prevProps.index !== this.props.index || prevState.isMoving !== this.state.isMoving))
      this.snapToIndex(this.props.index);
  }

  render()
  {
    return (
      <Animated.View
        style={[
          s.draggable,
          this.props.horizontal === true ? {height:"100%"} : {width:"100%"},
          this.state.position.getLayout(),
          {zIndex:(this.state.isMoving === true ? 2 : 1)}
        ]}
        onLayout={(event) => this.setState(
          {...this.state, itemSize:(this.props.horizontal === true ? event.nativeEvent.layout.width : event.nativeEvent.layout.height)})}
      >
        {this.props.renderItem(this.state.panResponder.panHandlers, this.props.id, this.props.itemData)}
      </Animated.View>
    );
  }
}

const s = StyleSheet.create({
  draggable:
  {
    justifyContent:'center',
    alignItems:'center',
    overflow:'visible'
  },
  sphere:
  {
    ...StyleSheet.absoluteFill,
    borderRadius:100,
    overflow:'visible'
  },
});
