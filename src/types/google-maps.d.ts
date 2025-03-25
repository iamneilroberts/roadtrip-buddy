// Type definitions for Google Maps JavaScript API
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getDiv(): Element;
      getZoom(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      styles?: any[];
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
      toString(): string;
      toUrlValue(precision?: number): string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds): boolean;
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      intersects(other: LatLngBounds): boolean;
      isEmpty(): boolean;
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      setLabel(label: string | MarkerLabel): void;
      setIcon(icon: string | Icon | Symbol): void;
      setDraggable(draggable: boolean): void;
      setVisible(visible: boolean): void;
      getPosition(): LatLng;
      getTitle(): string;
      getMap(): Map | null;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      label?: string | MarkerLabel;
      draggable?: boolean;
      clickable?: boolean;
      animation?: Animation;
      visible?: boolean;
      zIndex?: number;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
      labelOrigin?: Point;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      equals(other: Size): boolean;
      width: number;
      height: number;
    }

    class Point {
      constructor(x: number, y: number);
      equals(other: Point): boolean;
      x: number;
      y: number;
    }

    enum Animation {
      BOUNCE,
      DROP
    }

    class Symbol {
      constructor(opts?: SymbolOptions);
    }

    interface SymbolOptions {
      path: SymbolPath | string;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }

    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult, status: DirectionsStatus) => void): void;
    }

    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral | Place;
      destination: string | LatLng | LatLngLiteral | Place;
      travelMode: TravelMode;
      transitOptions?: TransitOptions;
      drivingOptions?: DrivingOptions;
      unitSystem?: UnitSystem;
      waypoints?: DirectionsWaypoint[];
      optimizeWaypoints?: boolean;
      provideRouteAlternatives?: boolean;
      avoidFerries?: boolean;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      region?: string;
    }

    interface Place {
      location: LatLng | LatLngLiteral;
      placeId: string;
      query: string;
    }

    enum TravelMode {
      BICYCLING,
      DRIVING,
      TRANSIT,
      WALKING
    }

    interface TransitOptions {
      arrivalTime?: Date;
      departureTime?: Date;
      modes?: TransitMode[];
      routingPreference?: TransitRoutePreference;
    }

    enum TransitMode {
      BUS,
      RAIL,
      SUBWAY,
      TRAIN,
      TRAM
    }

    enum TransitRoutePreference {
      FEWER_TRANSFERS,
      LESS_WALKING
    }

    interface DrivingOptions {
      departureTime: Date;
      trafficModel?: TrafficModel;
    }

    enum TrafficModel {
      BEST_GUESS,
      OPTIMISTIC,
      PESSIMISTIC
    }

    enum UnitSystem {
      IMPERIAL,
      METRIC
    }

    interface DirectionsWaypoint {
      location: string | LatLng | LatLngLiteral | Place;
      stopover?: boolean;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      bounds: LatLngBounds;
      copyrights: string;
      legs: DirectionsLeg[];
      overview_path: LatLng[];
      overview_polyline: string;
      warnings: string[];
      waypoint_order: number[];
    }

    interface DirectionsLeg {
      arrival_time: Time;
      departure_time: Time;
      distance: Distance;
      duration: Duration;
      duration_in_traffic: Duration;
      end_address: string;
      end_location: LatLng;
      start_address: string;
      start_location: LatLng;
      steps: DirectionsStep[];
      via_waypoints: LatLng[];
    }

    interface DirectionsStep {
      distance: Distance;
      duration: Duration;
      end_location: LatLng;
      instructions: string;
      path: LatLng[];
      start_location: LatLng;
      steps: DirectionsStep[];
      transit: TransitDetails;
      travel_mode: TravelMode;
    }

    interface Distance {
      text: string;
      value: number;
    }

    interface Duration {
      text: string;
      value: number;
    }

    interface Time {
      text: string;
      time_zone: string;
      value: Date;
    }

    interface TransitDetails {
      arrival_stop: TransitStop;
      arrival_time: Time;
      departure_stop: TransitStop;
      departure_time: Time;
      headsign: string;
      headway: number;
      line: TransitLine;
      num_stops: number;
    }

    interface TransitStop {
      location: LatLng;
      name: string;
    }

    interface TransitLine {
      agencies: TransitAgency[];
      color: string;
      icon: string;
      name: string;
      short_name: string;
      text_color: string;
      url: string;
      vehicle: TransitVehicle;
    }

    interface TransitAgency {
      name: string;
      phone: string;
      url: string;
    }

    interface TransitVehicle {
      icon: string;
      local_icon: string;
      name: string;
      type: VehicleType;
    }

    enum VehicleType {
      BUS,
      CABLE_CAR,
      COMMUTER_TRAIN,
      FERRY,
      FUNICULAR,
      GONDOLA_LIFT,
      HEAVY_RAIL,
      HIGH_SPEED_TRAIN,
      INTERCITY_BUS,
      METRO_RAIL,
      MONORAIL,
      OTHER,
      RAIL,
      SHARE_TAXI,
      SUBWAY,
      TRAM,
      TROLLEYBUS
    }

    enum DirectionsStatus {
      INVALID_REQUEST,
      MAX_WAYPOINTS_EXCEEDED,
      NOT_FOUND,
      OK,
      OVER_QUERY_LIMIT,
      REQUEST_DENIED,
      UNKNOWN_ERROR,
      ZERO_RESULTS
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setDirections(directions: DirectionsResult): void;
      setMap(map: Map | null): void;
      setOptions(options: DirectionsRendererOptions): void;
      setPanel(panel: Element): void;
      setRouteIndex(routeIndex: number): void;
      getDirections(): DirectionsResult;
      getMap(): Map | null;
      getPanel(): Element;
      getRouteIndex(): number;
    }

    interface DirectionsRendererOptions {
      directions?: DirectionsResult;
      draggable?: boolean;
      hideRouteList?: boolean;
      infoWindow?: InfoWindow;
      map?: Map;
      markerOptions?: MarkerOptions;
      panel?: Element;
      polylineOptions?: PolylineOptions;
      preserveViewport?: boolean;
      routeIndex?: number;
      suppressBicyclingLayer?: boolean;
      suppressInfoWindows?: boolean;
      suppressMarkers?: boolean;
      suppressPolylines?: boolean;
    }

    interface PolylineOptions {
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      geodesic?: boolean;
      icons?: IconSequence[];
      map?: Map;
      path?: LatLng[] | LatLngLiteral[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      visible?: boolean;
      zIndex?: number;
    }

    interface IconSequence {
      fixedRotation?: boolean;
      icon?: Symbol;
      offset?: string;
      repeat?: string;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      close(): void;
      getContent(): string | Element;
      getPosition(): LatLng;
      getZIndex(): number;
      open(map: Map | StreetViewPanorama, anchor?: MVCObject): void;
      setContent(content: string | Element): void;
      setOptions(options: InfoWindowOptions): void;
      setPosition(position: LatLng | LatLngLiteral): void;
      setZIndex(zIndex: number): void;
    }

    interface InfoWindowOptions {
      content?: string | Element;
      disableAutoPan?: boolean;
      maxWidth?: number;
      pixelOffset?: Size;
      position?: LatLng | LatLngLiteral;
      zIndex?: number;
    }

    class MVCObject {
      addListener(eventName: string, handler: Function): MapsEventListener;
      bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
      changed(key: string): void;
      get(key: string): any;
      notify(key: string): void;
      set(key: string, value: any): void;
      setValues(values: any): void;
      unbind(key: string): void;
      unbindAll(): void;
    }

    interface MapsEventListener {
      remove(): void;
    }

    class StreetViewPanorama {
      constructor(container: Element, opts?: StreetViewPanoramaOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setPov(pov: StreetViewPov): void;
      setVisible(flag: boolean): void;
      getLinks(): StreetViewLink[];
      getLocation(): StreetViewLocation;
      getPano(): string;
      getPhotographerPov(): StreetViewPov;
      getPosition(): LatLng;
      getPov(): StreetViewPov;
      getStatus(): StreetViewStatus;
      getVisible(): boolean;
      getZoom(): number;
      registerPanoProvider(provider: (pano: string) => StreetViewPanoramaData): void;
      setLinks(links: StreetViewLink[]): void;
      setPano(pano: string): void;
      setZoom(zoom: number): void;
    }

    interface StreetViewPanoramaOptions {
      addressControl?: boolean;
      addressControlOptions?: StreetViewAddressControlOptions;
      clickToGo?: boolean;
      disableDefaultUI?: boolean;
      disableDoubleClickZoom?: boolean;
      enableCloseButton?: boolean;
      fullscreenControl?: boolean;
      fullscreenControlOptions?: FullscreenControlOptions;
      imageDateControl?: boolean;
      linksControl?: boolean;
      motionTracking?: boolean;
      motionTrackingControl?: boolean;
      motionTrackingControlOptions?: MotionTrackingControlOptions;
      panControl?: boolean;
      panControlOptions?: PanControlOptions;
      pano?: string;
      position?: LatLng | LatLngLiteral;
      pov?: StreetViewPov;
      scrollwheel?: boolean;
      showRoadLabels?: boolean;
      visible?: boolean;
      zoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: ZoomControlOptions;
    }

    interface StreetViewAddressControlOptions {
      position?: ControlPosition;
    }

    interface FullscreenControlOptions {
      position?: ControlPosition;
    }

    interface MotionTrackingControlOptions {
      position?: ControlPosition;
    }

    interface PanControlOptions {
      position?: ControlPosition;
    }

    interface ZoomControlOptions {
      position?: ControlPosition;
      style?: ZoomControlStyle;
    }

    enum ControlPosition {
      BOTTOM_CENTER,
      BOTTOM_LEFT,
      BOTTOM_RIGHT,
      LEFT_BOTTOM,
      LEFT_CENTER,
      LEFT_TOP,
      RIGHT_BOTTOM,
      RIGHT_CENTER,
      RIGHT_TOP,
      TOP_CENTER,
      TOP_LEFT,
      TOP_RIGHT
    }

    enum ZoomControlStyle {
      DEFAULT,
      LARGE,
      SMALL
    }

    interface StreetViewPov {
      heading: number;
      pitch: number;
    }

    interface StreetViewLink {
      description?: string;
      heading?: number;
      pano?: string;
    }

    interface StreetViewLocation {
      description?: string;
      latLng?: LatLng;
      pano?: string;
      shortDescription?: string;
    }

    enum StreetViewStatus {
      OK,
      UNKNOWN_ERROR,
      ZERO_RESULTS
    }

    interface StreetViewPanoramaData {
      copyright?: string;
      imageDate?: string;
      links?: StreetViewLink[];
      location?: StreetViewLocation;
      tiles?: StreetViewTileData;
    }

    interface StreetViewTileData {
      centerHeading?: number;
      tileSize?: Size;
      worldSize?: Size;
    }

    class MapTypeId {
      static HYBRID: string;
      static ROADMAP: string;
      static SATELLITE: string;
      static TERRAIN: string;
    }

    interface MapMouseEvent {
      latLng?: LatLng;
      stop(): void;
    }
  }

  namespace places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      getBounds(): maps.LatLngBounds;
      getPlace(): PlaceResult;
      setBounds(bounds: maps.LatLngBounds | maps.LatLngBoundsLiteral): void;
      setComponentRestrictions(restrictions: ComponentRestrictions): void;
      setFields(fields: string[]): void;
      setOptions(options: AutocompleteOptions): void;
      setTypes(types: string[]): void;
    }

    interface AutocompleteOptions {
      bounds?: maps.LatLngBounds | maps.LatLngBoundsLiteral;
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      placeIdOnly?: boolean;
      strictBounds?: boolean;
      types?: string[];
    }

    interface ComponentRestrictions {
      country: string | string[];
    }

    interface PlaceResult {
      address_components?: AddressComponent[];
      adr_address?: string;
      aspects?: PlaceAspectRating[];
      business_status?: string;
      formatted_address?: string;
      formatted_phone_number?: string;
      geometry?: PlaceGeometry;
      html_attributions?: string[];
      icon?: string;
      international_phone_number?: string;
      name?: string;
      opening_hours?: OpeningHours;
      photos?: PlacePhoto[];
      place_id?: string;
      plus_code?: PlusCode;
      price_level?: number;
      rating?: number;
      reviews?: PlaceReview[];
      types?: string[];
      url?: string;
      user_ratings_total?: number;
      utc_offset?: number;
      vicinity?: string;
      website?: string;
    }

    interface AddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface PlaceAspectRating {
      rating: number;
      type: string;
    }

    interface PlaceGeometry {
      location: maps.LatLng;
      viewport: maps.LatLngBounds;
    }

    interface OpeningHours {
      open_now: boolean;
      periods: OpeningPeriod[];
      weekday_text: string[];
    }

    interface OpeningPeriod {
      close: OpeningHoursTime;
      open: OpeningHoursTime;
    }

    interface OpeningHoursTime {
      day: number;
      hours: number;
      minutes: number;
      nextDate: number;
      time: string;
    }

    interface PlacePhoto {
      height: number;
      html_attributions: string[];
      width: number;
      getUrl(opts: PhotoOptions): string;
    }

    interface PhotoOptions {
      maxHeight?: number;
      maxWidth?: number;
    }

    interface PlusCode {
      compound_code: string;
      global_code: string;
    }

    interface PlaceReview {
      author_name: string;
      author_url: string;
      language: string;
      profile_photo_url: string;
      rating: number;
      relative_time_description: string;
      text: string;
      time: number;
    }
  }
}

declare global {
  interface Window {
    google: typeof google;
  }
}
