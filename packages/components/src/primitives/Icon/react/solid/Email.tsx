import Svg, { SvgProps, Path } from 'react-native-svg';
const SvgEmail = (props: SvgProps) => (
  <Svg fill="none" viewBox="0 0 24 24" accessibilityRole="image" {...props}>
    <Path
      fill="currentColor"
      d="M2.12 6.209a3.96 3.96 0 0 0-.09.596C2 7.18 2 7.635 2 8.161v7.678c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h11.677c.528 0 .982 0 1.357-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V8.16c0-.527 0-.981-.03-1.356a3.96 3.96 0 0 0-.09-.596l-7.98 6.529a3 3 0 0 1-3.8 0l-7.98-6.53Z"
    />
    <Path
      fill="currentColor"
      d="M20.74 4.557a3.002 3.002 0 0 0-.378-.23c-.378-.193-.772-.264-1.167-.296A17.9 17.9 0 0 0 17.839 4H6.16c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-.379.23l8.108 6.633a1 1 0 0 0 1.266 0l8.108-6.633Z"
    />
  </Svg>
);
export default SvgEmail;