import { Component } from "../../lib/juicy"
import { ParticleManagerComponent } from "../components/particle-manager"
import { MapComponent } from '../components/map';

export function getParticlesFromComponent(component: Component) {
   return component.entity.state.get('particles')?.get(ParticleManagerComponent)
}

export function getMapFromComponent(component: Component) {
   return component.entity.state.get('map')?.get(MapComponent)
}