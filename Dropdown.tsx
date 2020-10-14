import React, { Component, useEffect, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Modal,
    StyleSheet,
    ScrollView,
    ViewStyle,
    TextStyle,
    Keyboard,
    ModalBaseProps,
    SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function C({ children }) {
    return children;
}

export interface Element {
    title: string;
    value: any;
}

export interface ValueStyle {
    valueText: TextStyle;
    valueBox: ViewStyle;
}

export interface ValueStyleVariants {
    placeholder?: StyleSheet.NamedStyles<ValueStyle>;
    default: StyleSheet.NamedStyles<ValueStyle>;
}

export interface indicatorColorVariants {
    placeholder?: string;
    default: string;
}

export interface DropdownStyle {
    modal: ViewStyle;
    safeAreaStyle: ViewStyle;
    hiddenCloseButton: ViewStyle;
    optionBox: ViewStyle;
    optionBoxLast?: ViewStyle;
    optionText: TextStyle;
    optionTextActive?: TextStyle;
    options?: ViewStyle;
    optionsContentContainer?: ViewStyle;
    searchInput?: TextStyle;
    noOptionsFoundText?: TextStyle;
}

export interface ValueBoxProps {
    children?: JSX.Element;
    style: ValueStyle;
    isOpen: boolean;
    indicatorColor: string;
    disabled: boolean;
    onPress: () => void;
}

export function ValueBox({
    children = null,
    style,
    isOpen,
    indicatorColor,
    disabled,
    onPress,
}: ValueBoxProps) {
    return (
        <TouchableOpacity
            disabled={disabled}
            style={[style.valueBox, disabled ? { opacity: 0.4 } : null]}
            onPress={onPress}>
            {children}
            {isOpen ? (
                <Ionicons
                    name="md-arrow-dropdown"
                    size={24}
                    color={indicatorColor}
                />
            ) : (
                <Ionicons
                    name="md-arrow-dropup"
                    size={24}
                    color={indicatorColor}
                />
            )}
        </TouchableOpacity>
    );
}

export interface TextValueProps extends ValueBoxProps {
    value: string;
    cut: boolean;
}

export function TextValue({
    style,
    isOpen,
    value,
    indicatorColor,
    onPress,
    disabled,
    cut,
}: TextValueProps) {
    return (
        <ValueBox
            disabled={disabled}
            onPress={onPress}
            style={style}
            isOpen={isOpen}
            indicatorColor={indicatorColor}>
            <Text style={style.valueText}>
                {cut && value.length >= 15 ? value.slice(0, 15) + '...' : value}
            </Text>
        </ValueBox>
    );
}

export function Option({ isLast, item, style, onSelect }) {
    const [isActive, activate] = useState(false);

    const optStyle =
        isLast && style.optionBoxLast
            ? [style.optionBox, style.optionBoxLast]
            : [style.optionBox];

    return (
        <TouchableOpacity
            key={item.title + item.value}
            onPress={onSelect}
            onPressIn={() => activate(true)}
            onPressOut={() => activate(false)}
            style={optStyle}>
            <Text
                style={[style.optionText, isActive && style.optionTextActive]}>
                {item.title}
            </Text>
        </TouchableOpacity>
    );
}

export interface OptionsProps {
    options: Props['options'];
    style: DropdownStyle;
    onSelect: (o: Element) => void;
    showNoOptionsText?: boolean;
}

export function Options({
    onSelect,
    options,
    style,
    showNoOptionsText = false,
}: OptionsProps) {
    return (
        <ScrollView
            contentContainerStyle={style.optionsContentContainer}
            style={style.options}
            keyboardShouldPersistTaps="handled"
            bounces={true}>
            {options.length === 0 &&
                (!showNoOptionsText ? (
                    <Text style={style.noOptionsFoundText}>
                        Es wurden keine Ergebnisse zu Ihrer Suche gefunden.
                    </Text>
                ) : null)}
            {options.map((o, idx) => (
                <Option
                    isLast={idx === options.length - 1}
                    key={o.title}
                    item={o}
                    style={style}
                    onSelect={() => onSelect(o)}
                />
            ))}
        </ScrollView>
    );
}

export interface OptionsContainerProps {
    isOpen: boolean;
    onShow?: ModalBaseProps['onShow'];
    onClose?: () => void;
    children?: any;
    style: DropdownStyle;
    animationType: Props['animationType'];
}

export function OptionsContainer({
    isOpen,
    onClose,
    onShow,
    style,
    children,
    // animationType is the animation type for the modal.
    // This is per default "none". Be aware, animation types
    // can lead to 'funny' bugs (https://github.com/facebook/react-native/issues/10471).
    // Ex. the callback passed to onSelect starts a loadingScreen (implemented as another modal)
    // then it can happen that the second modal stays open altough it got pass visible=false.
    // It can probably happen despite "none" but "hopefully" not so often.
    animationType = 'none',
}: OptionsContainerProps) {
    const [keyboard, toggleKeyboard] = useState(false);

    useEffect(() => {
        const showListener = Keyboard.addListener('keyboardDidShow', () =>
            toggleKeyboard(true)
        );

        const hideListener = Keyboard.addListener('keyboardDidHide', () =>
            toggleKeyboard(false)
        );

        return () => {
            showListener.remove();
            hideListener.remove();
            if (keyboard) {
                Keyboard.dismiss();
            }
        };
    }, []);

    return (
        /*
         * ATTENTION, this is a comment!
         * Due to various bugs it is not really possible to arrange views with z-index, therefor we have to use a modal here.
         * Modal has the ability to lay over all views. Unfortunately you can use a modal "only" in fullscreen mode.
         * Therefore you create a modal and arrange the options in it.
         * Now it is no longer possibntle to click on anything because the modal is in the foreground.
         * Therefore you have to enclose the options within the modal with a button that is displayed over the whole display size.
         * If you click on this button the modal will be closed.
         * That the elements in the background are still visible modal is set transperant.
         * Even the TextInput we must faked (overlayed) because, like said before,
         * it's not possible to touch any element below the modal, although they are visibale
         */
        <Modal
            transparent={true}
            animationType={animationType}
            visible={isOpen}
            onRequestClose={onClose}
            onShow={onShow}>
            <SafeAreaView style={style.safeAreaStyle}>
                <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={1}
                    style={style.hiddenCloseButton}>
                    <View style={style.modal}>{children}</View>
                </TouchableOpacity>
            </SafeAreaView>
        </Modal>
    );
}

// getKey attempts to find a key for the optionsByValue index
function getKey(val: any, key?: Props['optionKey']) {
    if (key) {
        if (typeof key === 'function') {
            return key(val);
        } else {
            return val[key];
        }
    } else if (typeof val._key === 'function') {
        return val._key();
    } else {
        if (
            typeof val !== 'string' &&
            typeof val !== 'number' &&
            typeof val !== 'bigint'
        ) {
            throw new Error(
                "makeOptionsByValIdx: option.value isn't a string nor a number this can lead to errors when used as idx (map) key please provide either a optionKey or add a _key method to your object to define a key"
            );
        }

        return val.toString();
    }
}

// makeOptionsByValIdex creates a index to get the title for a given option value
export function makeOptionsByValIdx(
    options: Element[],
    key?: Props['optionKey']
) {
    const idx = new Map();
    options.forEach(opt => {
        idx.set(getKey(opt.value, key), opt.title);
    });

    return idx;
}

// optionTitle returns a title or undefined for the given option value
export function optionTitle(
    map: Map<any, string>,
    val: any,
    key?: Props['optionKey'],
    mustMatch?: boolean
): string {
    if (val) {
        const title = map.get(getKey(val, key));
        if (!title) {
            // if mustMatch is false it is allowed to return the value
            // even it doesn't match with any options. Hint, mustMatch only
            // works when val is a string
            if (val && mustMatch !== undefined && !mustMatch) {
                return val.toString();
            }

            return '';
        }

        return title;
    }

    return '';
}

export function selectStyle({
    indicatorColorVariants,
    valueStyleVariants,
    value,
    isOpen,
}) {
    const styles = value
        ? {
              indicatorColor: indicatorColorVariants.default,
              valueStyle: valueStyleVariants.default,
          }
        : {
              indicatorColor:
                  indicatorColorVariants.placeholder ||
                  indicatorColorVariants.default,
              valueStyle:
                  valueStyleVariants.placeholder || valueStyleVariants.default,
          };

    return styles;
}

export interface Measurements {
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
}

export interface State {
    open: boolean;
    measurements: Measurements | null;
}

export interface Props {
    cut: boolean;
    isOpen?: boolean;
    value: any;
    options: Element[];
    placeholder: string;
    style: DropdownStyle;
    valueStyle: ValueStyleVariants;
    indicatorColor: indicatorColorVariants;
    onSelect: (val: any) => void;
    disabled: boolean;
    optionKey?: ((val: any) => string | number) | string | number;
    animationType?: ModalBaseProps['animationType'];
}

export default class Dropdown extends Component<Props, State> {
    public ref: any;

    constructor(p: Props) {
        super(p);
        this.state = {
            open: false,
            measurements: {
                x: null,
                y: null,
                width: null,
                height: null,
                pageX: null,
                pageY: null,
            },
        };
    }

    public componentDidMount() {
        if (this.props.isOpen) {
            setTimeout(() => {
                this.setState({
                    open: true,
                });
            }, 2000);
        }
    }

    public render() {
        const {
            value,
            placeholder,
            disabled,
            onSelect,
            options,
            optionKey,
            style,
            indicatorColor: indicatorColorVariants,
            valueStyle: valueStyleVariants,
            animationType,
            cut,
        } = this.props;

        const { indicatorColor, valueStyle } = selectStyle({
            indicatorColorVariants,
            valueStyleVariants,
            value,
            isOpen: this.state.open,
        });

        // todo: memorize optionsByVal
        const optionsByVal = makeOptionsByValIdx(options, optionKey);

        return (
            <C>
                <TextValue
                    cut={cut}
                    disabled={disabled}
                    onPress={() => {
                        Keyboard.dismiss();
                        this.setState({ open: true });
                    }}
                    isOpen={this.state.open}
                    value={
                        optionTitle(optionsByVal, value, optionKey) ||
                        placeholder
                    }
                    style={valueStyle}
                    indicatorColor={indicatorColor}
                />
                <OptionsContainer
                    animationType={animationType}
                    style={style}
                    isOpen={this.state.open}
                    onClose={() => this.setState({ open: false })}>
                    <Options
                        options={options}
                        style={style}
                        onSelect={(option: Element) => {
                            this.setState({
                                open: false,
                            });
                            onSelect(option.value);
                        }}
                    />
                </OptionsContainer>
            </C>
        );
    }
}

export const styles = StyleSheet.create({});
