export type TemplateComponentProps = {
  attr: string;
};

const TemplateComponent: React.FC<TemplateComponentProps> = ({ attr }) => {
  return <div>{attr}</div>;
};

export default TemplateComponent;
