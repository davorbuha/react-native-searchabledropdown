import React, { Component, Ref } from 'react';
import { TextInput, TextInputProps, TextStyle, Keyboard } from 'react-native';
import {
    DropdownStyle,
    TextValue,
    Options,
    OptionsContainer,
    makeOptionsByValIdx,
    Props as DropdownProps,
    State as DropdownState,
    Element,
    optionTitle,
    C,
    selectStyle,
} from './Dropdown';

export interface RenderSearchInputProps {
    style: TextStyle;
    placeholder: DropdownProps['placeholder'];
    onChangeText: TextInputProps['onChangeText'];
    value: DropdownProps['value'];
    ref: (ref: any) => void;
    onSelect?: (text: string) => void;
    setModal?: (val: boolean) => void;
}

export interface Props extends DropdownProps {
    filterFn: (option: Element, input: any) => boolean;
    filterTriggerLimit: number;
    mustMatchOptions?: boolean;
    showNoOptionsText?: boolean;
    renderSearchInput?: (props: RenderSearchInputProps) => JSX.Element;
}

interface State extends DropdownState {
    textValue: string;
}

/*
 * Attention!
 * mustMatchOptions only can be set to false when value type is string.
 * When the dropdown catches the close signal it will pass a string (textValue) to onSelect.
 */
export default class SearchableDropdown extends Component<Props, State> {
    private textRef: any;
    public ref: any;

    constructor(p: Props) {
        super(p);
        this.state = {
            textValue: '',
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
            filterFn,
            style,
            options,
            showNoOptionsText,
            filterTriggerLimit,
            onSelect,
            disabled,
            mustMatchOptions = true,
            optionKey,
            renderSearchInput,
            indicatorColor: indicatorColorVariants,
            valueStyle: valueStyleVariants,
            animationType,
            cut,
        } = this.props;

        const { indicatorColor, valueStyle } = selectStyle({
            isOpen: this.state.open,
            value,
            indicatorColorVariants,
            valueStyleVariants,
        });

        const optionsByVal = makeOptionsByValIdx(this.props.options, optionKey);

        let opts = options;
        if (filterFn && this.state.textValue.length >= filterTriggerLimit) {
            opts = opts.filter((o: Element) =>
                filterFn(o, this.state.textValue)
            );
        }

        return (
            <C>
                <TextValue
                    cut={cut}
                    indicatorColor={indicatorColor}
                    disabled={disabled}
                    onPress={() => {
                        Keyboard.dismiss();
                        this.setState({ open: true });
                        // this.ref.measure(this.measureCallback);
                    }}
                    isOpen={this.state.open}
                    value={
                        optionTitle(
                            optionsByVal,
                            value,
                            optionKey,
                            mustMatchOptions
                        ) || placeholder
                    }
                    style={valueStyle}
                />
                <OptionsContainer
                    animationType={animationType}
                    onShow={() => this.textRef && this.textRef.focus()}
                    isOpen={this.state.open}
                    style={style}
                    onClose={() => {
                        if (!mustMatchOptions) {
                            onSelect(this.state.textValue);
                        }
                        this.setState({
                            open: false,
                            // textValue: '',
                        });
                    }}>
                    {renderSearchInput ? (
                        renderSearchInput({
                            onChangeText: text =>
                                this.setState({ textValue: text }),
                            value: this.state.textValue,
                            placeholder,
                            style: style.searchInput,
                            ref: ref => {
                                this.textRef = ref;
                            },
                            onSelect: onSelect,
                            setModal: (val: boolean) => {
                                this.setState({ open: val });
                            },
                        })
                    ) : (
                        <TextInput
                            ref={ref => (this.textRef = ref)}
                            style={style.searchInput}
                            onChangeText={text =>
                                this.setState({ textValue: text })
                            }
                            placeholder={placeholder}
                            value={this.state.textValue}
                        />
                    )}
                    {this.state.textValue.length >= filterTriggerLimit ? (
                        <Options
                            showNoOptionsText={showNoOptionsText}
                            style={style}
                            options={opts}
                            onSelect={(option: Element) => {
                                this.setState({
                                    open: false,
                                    textValue: '',
                                });
                                onSelect(option.value);
                            }}
                        />
                    ) : null}
                </OptionsContainer>
            </C>
        );
    }
}
