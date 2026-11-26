'use strict';
const {createController} = require('./controller');
const evaluate = createController();
const box = (name,x,y,w,h,confidence=0.95)=>({name,x,y,w,h,confidence});
const frame = {width:1000,height:600,objects:[box('door',200,100,600,400),box('door_left',200,100,200,400),box('door_right',600,100,200,400),box('pet_a',450,400,80,80)]};
const t = Date.UTC(2025,0,1);
for (const [label,offset,input] of [['First alert',0,frame],['Cooldown',1000,frame],['After cooldown',15000,frame],['Person nearby',30000,{...frame,objects:[...frame.objects,box('person',400,200,100,250)]}]]) {
  console.log(label, JSON.stringify(evaluate(input,t+offset),null,2));
}
