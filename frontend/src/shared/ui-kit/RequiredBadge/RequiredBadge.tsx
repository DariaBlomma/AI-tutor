// Красная звёздочка, обозначающая обязательное поле формы.
// Рендерится перед лейблом в flex-контейнере для выравнивания.
export function RequiredBadge() {
    return <span aria-hidden="true" className="requiredBadge">*</span>;
}
