import { Component } from "../../lib/juicy"
import { ParticleManagerComponent } from "../components/particle-manager"
import { MapComponent } from '../components/map';
import { Camera } from "../components/camera";

export function getParticlesFromComponent(component: Component) {
   return component.entity.state.get('particles')?.get(ParticleManagerComponent)
}

export function getCameraFromComponent(component: Component) {
   return component.entity.state.get('camera')?.get(Camera)
}

export function getMapFromComponent(component: Component) {
   return component.entity.state.get('map')?.get(MapComponent)
}