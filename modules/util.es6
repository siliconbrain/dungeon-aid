export function sum() {
    return arguments.reduce((accu, elem) => accu + elem, 0);
}