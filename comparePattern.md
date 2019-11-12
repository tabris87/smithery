## Vorgaben
1. Sortierung auf Typ
2. Sortierung auf Name (lexographisch

## Rekursive Visitor Methode

```
visitor(FST1, FST2)
    mergedFST
    - type = FST1.type
    - name = FST2.name

    children1 = FST1.children
    children2 = FST2.children

    newChildren = [];

    when children1 not empty and children2 not empty
        for each child of children2
            if child not in children1
                add child to newChildren
            else
                add result of visitor with child of children1 and child of children2
    
    when children1 empty and children2 not empty
        newChildren = children2
    
    when children1 empty and children2 empty
        FileCompare!

    return mergedFST

