import styled from 'styled-components';

interface HorizontalProps {
  readonly justifyContent?:
    | 'flex-start'
    | 'center'
    | 'space-evenly'
    | 'space-between'
    | 'flex-end'
    | 'space-around';
  readonly verticalCenter?: boolean;
  readonly baseline?: boolean;
  readonly spacing?: 1 | 2 | 3 | 4 | 5;
  readonly flex?: number;
  readonly flexWrap?: boolean;
  readonly alignItems?: 'flex-start' | 'center' | 'flex-end';
  readonly height?: string;
  readonly width?: string;
  readonly overflowHidden?: boolean;
  readonly position?: 'absolute' | 'relative';
  padding?: string;
}
const SPACING_VALS = [4, 8, 16, 24, 48];

export const $Horizontal = styled.div<HorizontalProps>`
  display: flex;
  ${(props) => props.flex && `flex: ${props.flex};`};
  ${(props) => props.justifyContent && `justify-content: ${props.justifyContent};`};
  ${(props) => props.verticalCenter && 'align-items: center;'};
  ${(props) => props.baseline && 'align-items: baseline;'};
  ${(props) => props.flexWrap && 'flex-wrap: wrap;'};
  ${(props) => props.alignItems && `align-items: ${props.alignItems};`};
  ${(props) => props.height && `height: ${props.height};`}
  ${(props) => props.width && `width: ${props.width};`}
  ${(props) => props.overflowHidden && `overflow: hidden;`}
  ${(props) => props.position && `position: ${props.position};`}
  ${(props) => props.padding && `padding: ${props.padding};`}


  & > *:not(:last-child) {
    margin-right: ${(props) => props.spacing && `${SPACING_VALS[props.spacing - 1]}px`};
  }
`;

export const $Vertical = styled.div<{
  spacing?: 1 | 2 | 3 | 4 | 5;
  flex?: number;
  width?: string;
  minWidth?: string;
  height?: string;
  padding?: string;
  maxWidth?: string;
  justifyContent?: string;
}>`
  display: flex;
  flex-direction: column;
  ${(props) => props.flex && `flex: ${props.flex};`};
  ${(props) => props.width && `width: ${props.width};`};
  ${(props) => props.height && `height: ${props.height};`};
  ${(props) => props.padding && `padding: ${props.padding};`}
  ${(props) => props.maxWidth && `max-width: ${props.maxWidth};`}
  ${(props) => props.justifyContent && `justify-content: ${props.justifyContent};`}
  ${(props) => props.minWidth && `min-width: ${props.minWidth};`}
  & > *:not(:last-child) {
    margin-bottom: ${(props) => props.spacing && `${SPACING_VALS[props.spacing - 1]}px`};
  }
`;

export const $ColumnGap = styled.div<{
  width?: string;
}>`
  display: flex;
  ${(props) => (props.width ? `width: ${props.width};` : `width: 10px`)};
`;

export const $InfoDescription = styled.div<{ fontSize?: string; marginBottom?: string }>`
  ${(props) => (props.fontSize ? `font-size: ${props.fontSize};` : `font-size: 1rem;`)}
  ${(props) =>
    props.marginBottom ? `margin-bottom: ${props.marginBottom};` : `margin-bottom: 30px;`}
  color: gray;
  max-width: 800px;
  font-weight: light;
`;

export const placeholderImage =
  'https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=';

export const placeholderGif =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-prod.appspot.com/o/assets%2Fgeneric%2Fconan.gif?alt=media&token=b75557ff-5f2b-40dc-aec9-d58485ad5656';

export const placeholderVideo =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-prod.appspot.com/o/assets%2Fgeneric%2FRise_of_Cultures.mp4?alt=media&token=d1e26e9d-ddd0-4c4a-b863-471976136280';

export const placeholderVideoThumbnail =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-prod.appspot.com/o/assets%2Fgeneric%2Fcolorful-dots-floating.gif?alt=media&token=d83e298c-fd5a-468e-9a31-f9e43c885bd7';

export const placeholderBackground =
  'https://firebasestorage.googleapis.com/v0/b/lootbox-fund-staging.appspot.com/o/shared-company-assets%2Fxxx3.png?alt=media&token=bfd1a458-38e5-47f9-a092-eb66bcee0f21';
