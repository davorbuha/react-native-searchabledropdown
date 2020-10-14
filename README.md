# react-native-dropdown

## Getting started

`$ npm install react-native-dropdown --save`

### Mostly automatic installation

`$ react-native link react-native-dropdown`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-dropdown` and add `Dropdown.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libDropdown.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.reactlibrary.DropdownPackage;` to the imports at the top of the file
  - Add `new DropdownPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-dropdown'
  	project(':react-native-dropdown').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-dropdown/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-dropdown')
  	```


## Usage
```javascript
import Dropdown from 'react-native-dropdown';

// TODO: What to do with the module?
Dropdown;
```
