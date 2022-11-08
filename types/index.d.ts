declare type DialogType = {
  title: string;
  visible: boolean;
};

declare type OptionType = {
  value: string;
  label: string;
  checked?: boolean;
  children?: OptionType[];
};
